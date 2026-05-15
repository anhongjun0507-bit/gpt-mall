"use server";

import { createClient } from "@/lib/supabase/server";
import { safeRedirect, getSiteUrl } from "@/lib/safe-redirect";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginValues,
  type SignupValues,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from "./schemas";

// Server Action 결과 형태.
// 성공 시 redirect 경로를 반환 — 클라이언트가 router.push 로 처리.
// (Server Action 내부에서 redirect() 호출 시 클라이언트 await 결과가
//  undefined 가 되면서 result.ok 접근이 TypeError 를 만드는 이슈 회피.)
export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  redirect?: string;
}

function localizeAuthError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "이메일 또는 비밀번호가 올바르지 않습니다";
  if (msg.includes("Email not confirmed")) return "이메일 인증이 완료되지 않았습니다";
  if (msg.includes("User already registered")) return "이미 가입된 이메일입니다";
  if (msg.includes("over_email_send_rate_limit") || msg.includes("rate limit")) return "잠시 후 다시 시도해주세요";
  if (msg.includes("Password should be")) return "비밀번호 정책을 만족하지 못합니다 (최소 8자)";
  if (msg.includes("Auth session missing")) return "세션이 만료되었습니다. 다시 시도해주세요";
  return msg;
}

// ─── 로그인 ──────────────────────────────────────────
export async function signInWithEmail(
  values: LoginValues,
  next?: string
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error) {
      return { ok: false, message: localizeAuthError(error.message) };
    }
  } catch (e) {
    console.error("[signInWithEmail] 실패", e);
    return { ok: false, message: "로그인 중 오류가 발생했어요" };
  }

  return { ok: true, redirect: safeRedirect(next, "/") };
}

// ─── 회원가입 (이메일 인증 비활성화 → 가입 즉시 로그인 세션 발급) ──
export async function signUpWithEmail(
  values: SignupValues
): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        // mailer_autoconfirm=true 상태에선 emailRedirectTo 는 사용되지 않지만
        // 향후 인증 재활성화 대비 유지.
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/`,
      },
    });
    if (error) {
      return { ok: false, message: localizeAuthError(error.message) };
    }
  } catch (e) {
    console.error("[signUpWithEmail] 실패", e);
    return { ok: false, message: "가입 중 오류가 발생했어요" };
  }

  // 자동 인증이라 세션이 바로 발급됨 → 홈으로
  return { ok: true, redirect: "/" };
}

// ─── 비밀번호 재설정 메일 발송 ─────────────────────
export async function requestPasswordReset(
  values: ForgotPasswordValues
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password`,
    });
    if (error) {
      return { ok: false, message: localizeAuthError(error.message) };
    }
  } catch (e) {
    console.error("[requestPasswordReset] 실패", e);
    return { ok: false, message: "메일 발송에 실패했어요" };
  }
  return {
    ok: true,
    message: "비밀번호 재설정 링크를 이메일로 보냈어요. 메일함을 확인해주세요.",
  };
}

// ─── 비밀번호 업데이트 ─────────────────────────────
export async function updatePassword(
  values: ResetPasswordValues
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });
    if (error) {
      return { ok: false, message: localizeAuthError(error.message) };
    }
  } catch (e) {
    console.error("[updatePassword] 실패", e);
    return { ok: false, message: "비밀번호 변경에 실패했어요" };
  }

  return { ok: true, redirect: "/login?reset=1" };
}
