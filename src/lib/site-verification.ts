import { NextResponse, type NextRequest } from "next/server";

// 검색엔진 소유확인용 HTML 파일 응답.
// 파일명에 토큰이 박히는 형식이라 정적 라우트로 만들 수 없고,
// app/[segment] 로 잡으면 최상위 오타 경로까지 삼켜 404 페이지가 죽는다.
// → 미들웨어에서 경로를 직접 매칭한다.
type Provider = {
  /** 파일명 접두사. 실제 경로는 /{prefix}{token}.html */
  prefix: string;
  /** 토큰을 담는 환경변수 이름 */
  envKey: "GOOGLE_SITE_VERIFICATION" | "NAVER_SITE_VERIFICATION";
  contentType: string;
  body: (token: string) => string;
};

const PROVIDERS: readonly Provider[] = [
  {
    prefix: "google",
    envKey: "GOOGLE_SITE_VERIFICATION",
    contentType: "text/plain; charset=utf-8",
    // 구글 서치콘솔 HTML 파일은 파일명을 그대로 되풀이하는 한 줄이 전부다.
    body: (token) => `google-site-verification: google${token}.html`,
  },
  {
    prefix: "naver",
    envKey: "NAVER_SITE_VERIFICATION",
    contentType: "text/html; charset=utf-8",
    // 네이버 서치어드바이저는 meta 태그를 담은 HTML 문서를 요구한다.
    body: (token) =>
      `<html><head><meta name="naver-site-verification" content="${token}" /></head><body>naver-site-verification: naver${token}.html</body></html>`,
  },
];

/**
 * 소유확인 파일 요청이면 응답을, 아니면 null 을 반환한다.
 * 환경변수가 없거나 토큰이 어긋나면 null → 일반 라우팅을 타고 404 가 된다.
 */
export function siteVerificationResponse(
  request: NextRequest,
): NextResponse | null {
  const { pathname } = request.nextUrl;

  for (const provider of PROVIDERS) {
    const token = process.env[provider.envKey];
    if (!token) continue;
    if (pathname !== `/${provider.prefix}${token}.html`) continue;

    return new NextResponse(provider.body(token), {
      status: 200,
      headers: {
        "content-type": provider.contentType,
        // 소유확인 파일 자체는 색인 대상이 아니다.
        "x-robots-tag": "noindex",
        "cache-control": "public, max-age=0, must-revalidate",
      },
    });
  }

  return null;
}
