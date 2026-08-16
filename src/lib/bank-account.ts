// 무통장 입금 계좌 정보 — 주문서·주문완료·마이페이지·텔레그램 알림이 공유한다.
// 계좌가 바뀌면 이 파일만 고치면 된다.

export const BANK_ACCOUNT = {
  bank: "농협",
  number: "312-0235-5766-41",
  holder: "디지털스토어",
} as const;

// "농협 312-0235-5766-41" — 복사 버튼/알림 등 한 줄 표기용
export const BANK_ACCOUNT_LINE = `${BANK_ACCOUNT.bank} ${BANK_ACCOUNT.number}`;

// 입금 기한 — 주문 시각 + 24시간. 초과해도 자동 취소하지 않고 운영자가 판단한다.
export const DEPOSIT_DUE_HOURS = 24;

export function calcDepositDueAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + DEPOSIT_DUE_HOURS * 60 * 60 * 1000);
}

// 입금 기한 표기 — "8월 17일 15시까지".
// Vercel 서버는 UTC 로 동작하므로 timeZone 을 반드시 명시한다 (미지정 시 9시간 어긋남).
export function formatDepositDue(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    hour: "numeric",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("month")} ${get("day")}일 ${get("hour")}시까지`;
}

// 입금 기한 초과 여부 — 입금대기 상태에서만 의미 있다.
export function isDepositOverdue(dueAt: string | null | undefined): boolean {
  if (!dueAt) return false;
  const t = new Date(dueAt).getTime();
  return Number.isFinite(t) && t < Date.now();
}
