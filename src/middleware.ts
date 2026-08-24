import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";
import { siteVerificationResponse } from "@/lib/site-verification";

// Next.js 미들웨어 진입점 — 모든 요청에서 세션 갱신.
export async function middleware(request: NextRequest) {
  // 검색엔진 소유확인 파일은 세션과 무관하므로 먼저 처리하고 빠져나간다.
  const verification = siteVerificationResponse(request);
  if (verification) return verification;

  return await updateSession(request);
}

// matcher: 정적 자원과 이미지/favicon은 제외해 비용 절감.
// _next/static, _next/image, favicon.ico 및 흔한 이미지 확장자 제외.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
