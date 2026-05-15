// 한국 원 통화 포맷 — 1000원 단위 콤마.
export const formatKRW = (v: number): string => `₩${v.toLocaleString("ko-KR")}`;

// 숫자만 추출 — Price input 의 사용자 입력 정규화.
export const stripNonDigits = (s: string): string => s.replace(/[^\d]/g, "");

// 숫자 → 콤마 포맷 (예: 28000 → "28,000")
export const formatNumber = (v: number | null | undefined): string =>
  typeof v === "number" ? v.toLocaleString("ko-KR") : "";
