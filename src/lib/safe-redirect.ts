// Open redirect 방어 — next 파라미터는 반드시 단일 슬래시로 시작하는 상대경로여야.
// "//other.com" 같은 protocol-relative URL 도 차단.
export function safeRedirect(
  next: string | string[] | null | undefined,
  fallback = "/"
): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next.startsWith("/\\")) return fallback;
  return next;
}

// 현재 환경의 절대 base URL — Server Action 의 emailRedirectTo 등에 사용.
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
