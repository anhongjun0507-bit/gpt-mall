"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getCurrentUser } from "@/lib/auth";

import {
  passwordChangeSchema,
  type PasswordChangeValues,
} from "./schema";

export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

// 현재 비밀번호 검증용 1회성 클라이언트 — cookies 영향 없음.
function makeVerifyClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function changePassword(
  values: PasswordChangeValues
): Promise<ActionResult> {
  const parsed = passwordChangeSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { currentPassword, newPassword } = parsed.data;

  const user = await getCurrentUser();
  if (!user?.email) return { ok: false, message: "로그인이 필요합니다" };

  // 소셜 사용자 — 이메일 provider 없으면 비밀번호 변경 불가.
  const identities = user.identities ?? [];
  if (!identities.some((i) => i.provider === "email")) {
    return {
      ok: false,
      message:
        "소셜 계정으로 가입하셨습니다. 비밀번호는 해당 플랫폼에서 변경해주세요.",
    };
  }

  const service = createServiceRoleClient();

  // 1) Rate limit — 최근 5분 내 실패 시도 5건 이상이면 차단
  try {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error } = await service
      .from("password_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since);
    if (error) throw error;
    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return {
        ok: false,
        message: "비밀번호 시도가 너무 많아요. 5분 후 다시 시도해주세요.",
      };
    }
  } catch (e) {
    console.error("[changePassword] rate limit 체크 실패", e);
    // 체크 자체 실패 시 fail-open — 다음 단계의 검증은 그대로 작동
  }

  // 2) 현재 비밀번호 검증 — 익명 클라이언트로 signInWithPassword. 본 세션엔 영향 X.
  const verify = makeVerifyClient();
  const { error: verifyErr } = await verify.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyErr) {
    try {
      await service.from("password_attempts").insert({ user_id: user.id });
    } catch (e) {
      console.error("[changePassword] attempt 기록 실패", e);
    }
    return {
      ok: false,
      fieldErrors: {
        currentPassword: ["현재 비밀번호가 일치하지 않아요"],
      },
    };
  }

  // 3) 새 비밀번호로 업데이트 — 본 cookies 클라이언트 사용
  try {
    const supabase = createClient();
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateErr) throw updateErr;

    // 4) 성공 — 누적 시도 카운터 정리
    try {
      await service
        .from("password_attempts")
        .delete()
        .eq("user_id", user.id);
    } catch (e) {
      console.error("[changePassword] cleanup 실패", e);
    }

    return { ok: true };
  } catch (e) {
    console.error("[changePassword] updateUser 실패", e);
    return {
      ok: false,
      message: "비밀번호 변경에 실패했어요. 잠시 후 다시 시도해주세요.",
    };
  }
}
