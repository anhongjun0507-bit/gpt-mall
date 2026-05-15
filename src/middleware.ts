import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Next.js 미들웨어 진입점 — 모든 요청에서 세션 갱신.
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// matcher: 정적 자원과 이미지/favicon은 제외해 비용 절감.
// _next/static, _next/image, favicon.ico 및 흔한 이미지 확장자 제외.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
