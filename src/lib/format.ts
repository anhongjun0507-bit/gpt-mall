// 한국 원 통화 포맷 — 1000원 단위 콤마.
export const formatKRW = (v: number): string => `₩${v.toLocaleString("ko-KR")}`;

// 숫자만 추출 — Price input 의 사용자 입력 정규화.
export const stripNonDigits = (s: string): string => s.replace(/[^\d]/g, "");

// 숫자 → 콤마 포맷 (예: 28000 → "28,000")
export const formatNumber = (v: number | null | undefined): string =>
  typeof v === "number" ? v.toLocaleString("ko-KR") : "";

// ─── 날짜·시간 ──────────────────────────────────────────────────────
// DB 는 timestamptz(UTC) 로 저장하고 표시 계층에서만 KST 로 변환한다.
// Vercel 서버 로케일이 UTC 라 timeZone 을 생략하면 서버 렌더 결과가 9시간
// 어긋난다 — 운영자가 통장 입금 시각과 주문 시각을 대조하므로 치명적.
// 날짜 표시는 반드시 이 헬퍼들을 거칠 것.

export const KST_TIME_ZONE = "Asia/Seoul";

export type DateInput = string | number | Date;

function toDate(value: DateInput): Date | null {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// "2026-08-16 19:41" — 목록·상세의 기본 일시 표기 (24시간제)
export function formatDateTimeKST(value: DateInput): string {
  const d = toDate(value);
  if (!d) return "-";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(d)
    .replace(", ", " ");
}

// "2026년 8월 16일"
export function formatDateKST(value: DateInput): string {
  const d = toDate(value);
  if (!d) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

// "2026년 8월 16일 일요일" — 관리자 대시보드 인사말 등
export function formatDateWithWeekdayKST(value: DateInput): string {
  const d = toDate(value);
  if (!d) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(d);
}

// ─── 월 환산가 ──────────────────────────────────────────────────────
// 상품명에 "N개월" 이 들어있는 기간제 상품만 월 단가를 함께 보여준다.
// N < 2 는 환산 의미가 없고, 매칭 안 되는 상품(패키지 등)은 표시하지 않는다.
// 값은 항상 가격에서 계산한다 — 하드코딩 금지.
export function formatMonthlyPrice(
  name: string,
  price: number
): string | null {
  const matched = /(\d+)개월/.exec(name);
  if (!matched) return null;
  const months = Number(matched[1]);
  if (!Number.isFinite(months) || months < 2) return null;
  return `월 ${formatNumber(Math.round(price / months))}원 (${months}개월 기준)`;
}
