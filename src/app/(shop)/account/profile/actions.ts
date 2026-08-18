"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getCurrentUser } from "@/lib/auth";
import type { OrderStatus } from "@/types/database";

import { profileSchema, type ProfileValues } from "./schema";

export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateProfile(
  values: ProfileValues
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다" };

  try {
    const supabase = createClient();
    // role 은 명시적으로 update 하지 않는다. RLS profiles_update_self 도
    // 본인 row 만 허용하며, prevent_role_self_change 트리거가 추가 방어.
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: parsed.data.display_name.trim(),
        phone: parsed.data.phone,
      })
      .eq("id", user.id);
    if (error) throw error;

    revalidatePath("/account");
    revalidatePath("/account/profile");

    return { ok: true };
  } catch (e) {
    console.error("[account/profile] 업데이트 실패", e);
    return {
      ok: false,
      message: "저장에 실패했어요. 잠시 후 다시 시도해주세요.",
    };
  }
}

// ──────────────────────────────────────────────────────────────────────
// deleteAccount — 회원 탈퇴.
//
// 대상 사용자는 세션에서만 얻는다 (파라미터로 받지 않음) — 타인 계정 삭제 봉쇄.
//
// 실행 순서와 근거:
//   1) admin role 차단 → 2) 미완료 주문 차단 → 3) orders 탈퇴 스탬프
//   → 4) auth.users 삭제 → 5) signOut
//
//   3)을 4)보다 먼저 하는 이유: 삭제 후에는 orders.user_id 가 이미 NULL 이라
//   어느 주문이 이 사용자 것이었는지 식별할 방법이 없다. 반대로 스탬프만
//   찍히고 4)가 실패하면 남는 잔여물은 살아있는 계정의 타임스탬프뿐이라
//   재시도로 자연 복구된다.
//
//   profiles 를 직접 지우지 않는 이유: profiles.id 는 auth.users 에 대해
//   ON DELETE CASCADE 라 4) 한 번으로 같은 트랜잭션에서 함께 사라진다
//   (password_attempts 도 동일). 만약 profiles 를 먼저 지웠는데 4)가 실패하면
//   profile 없는 좀비 계정이 남고, handle_new_user 트리거는 INSERT 시점에만
//   돌기 때문에 profiles 가 다시 생기지 않아 로그인은 되는데 마이페이지가
//   깨지는 최악의 중간 상태가 된다. 그래서 삭제는 auth.users 한 번뿐이다.
// ──────────────────────────────────────────────────────────────────────

// 배송/발급이 끝나지 않은 상태 — 이 주문이 있으면 탈퇴를 막는다.
const BLOCKING_ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "awaiting_deposit",
  "paid",
];

export async function deleteAccount(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다" };

  try {
    const service = createServiceRoleClient();

    // 1) 운영 계정 보호 — admin 은 이 화면으로 탈퇴할 수 없다.
    const { data: profile, error: profileErr } = await service
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profileErr) throw profileErr;
    if (profile?.role === "admin") {
      return {
        ok: false,
        message: "관리자 계정은 이 화면에서 탈퇴할 수 없습니다.",
      };
    }

    // 2) 진행 중인 주문 차단
    const { count, error: orderErr } = await service
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("status", BLOCKING_ORDER_STATUSES);
    if (orderErr) throw orderErr;
    if ((count ?? 0) > 0) {
      return {
        ok: false,
        message:
          "진행 중인 주문이 있어 탈퇴할 수 없습니다. 주문이 완료된 뒤 다시 시도해주세요.",
      };
    }

    // 3) 탈퇴 스탬프 — 삭제 후에는 대상 주문을 특정할 수 없으므로 먼저 기록.
    const { error: stampErr } = await service
      .from("orders")
      .update({ user_withdrawn_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (stampErr) throw stampErr;

    // 4) auth.users 삭제 — profiles·password_attempts 는 CASCADE 로 함께 삭제,
    //    orders.user_id 는 SET NULL 로 끊기고 주문 행 자체는 보존된다.
    const { error: deleteErr } = await service.auth.admin.deleteUser(user.id);
    if (deleteErr) throw deleteErr;

    // 5) 세션 쿠키 정리. 계정이 이미 없어 서버 logout 은 401/404 로 떨어지지만
    //    auth-js 가 이를 무시하고 로컬 세션(쿠키)을 지우므로 결과는 동일하다.
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });

    revalidatePath("/admin/orders");

    return { ok: true };
  } catch (e) {
    console.error("[account/profile] 회원 탈퇴 실패", e);
    return {
      ok: false,
      message: "탈퇴 처리에 실패했어요. 잠시 후 다시 시도해주세요.",
    };
  }
}
