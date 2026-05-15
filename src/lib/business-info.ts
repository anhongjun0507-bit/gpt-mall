// 사업자 정보 — 사이트 전체의 단일 소스.
// 전자상거래법상 필수 표시 항목이라 Footer / 약관 / 사업자정보 페이지 /
// 알림톡 템플릿 모두 여기서 가져온다. 하드코딩 금지.
//
// 정책:
// - 개인사업자라 상호명에 "(주)" / 주식회사 표기 절대 X.
// - 전화번호는 운영하지 않으므로 표기 X. 문의는 이메일 또는 카톡 채널로.
// - 정산 계좌(PG 정산용)는 사이트 어디에도 노출 X. 운영자가 별도 보관.

export const BUSINESS_INFO = {
  name: "디지털스토어",
  ceo: "이현석",
  brn: "213-07-74335", // 사업자등록번호 (간이과세자)
  mailOrderLicense: "제 2026-경기평택-0037호", // 통신판매업 신고번호
  address: "경기도 평택시 용죽1로 65, 105-104",
  email: "support@digitalst.kr",
  businessType: "도매 및 소매업", // 업태
  items: "전자상거래 소매업(소프트웨어), 해외직구대행업", // 종목
  openedAt: "2021-04-16", // 개업일 (YYYY-MM-DD)
  siteName: "디지털스토어",
  siteUrl: "https://digitalst.kr",
} as const;

export type BusinessInfo = typeof BUSINESS_INFO;
