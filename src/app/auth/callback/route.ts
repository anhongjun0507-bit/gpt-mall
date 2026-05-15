import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";

// 이메일 인증 + OAuth 공통 콜백 — Supabase 가 발급한 code 를 세션으로 교환.
//
// 도착 경로:
//   - 회원가입 이메일 인증 클릭 → ?code=...&next=/account
//   - 비밀번호 재설정 메일 클릭 → ?code=...&next=/reset-password
//   - 카카오/네이버 OAuth 콜백 → ?code=...&next=/...
//
// 실패 시 /login?error=<코드> 로 리다이렉트.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get("code");
  const next = safeRedirect(searchParams.get("next"), "/");

  // 1. Supabase 가 에러 파라미터를 직접 붙여 보낸 경우
  const oauthError = searchParams.get("error");
  if (oauthError) {
    const desc = searchParams.get("error_description");
    console.error("[auth/callback] provider error", oauthError, desc);
    return NextResponse.redirect(
      `${origin}/login?error=oauth_failed`,
      { status: 303 }
    );
  }

  // 2. code 누락 (잘못된 진입)
  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=missing_code`,
      { status: 303 }
    );
  }

  // 3. code 를 세션으로 교환 — 쿠키는 server client 의 cookies.setAll 통해 자동 설정.
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchange 실패", error.message);
      return NextResponse.redirect(
        `${origin}/login?error=exchange_failed`,
        { status: 303 }
      );
    }
  } catch (e) {
    console.error("[auth/callback] 예외", e);
    return NextResponse.redirect(
      `${origin}/login?error=oauth_failed`,
      { status: 303 }
    );
  }

  // 4. 성공 — next 로 리다이렉트 (safeRedirect 가 외부 URL 차단)
  return NextResponse.redirect(`${origin}${next}`, { status: 303 });
}
