// 네이버 OAuth 흐름의 cookie 키 — start/callback 두 라우트가 공유.
// Route 파일에서 직접 export 하면 Next.js 가 "valid Route export field 아님" 에러.

export const STATE_COOKIE = "naver_oauth_state";
export const NEXT_COOKIE = "naver_oauth_next";
