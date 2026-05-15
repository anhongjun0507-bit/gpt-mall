import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

// 로그아웃 — POST 만 허용 (CSRF / prefetch 보호).
// Form 에서 method="POST" action="/auth/signout" 으로 호출.
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (e) {
    console.error("[auth/signout] 실패", e);
    // 실패해도 홈으로 보냄 — 보안상 사용자에게 노출할 정보 아님
  }

  const { origin } = new URL(request.url);
  // 303 See Other — POST 응답이지만 다음 요청은 GET 으로
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
