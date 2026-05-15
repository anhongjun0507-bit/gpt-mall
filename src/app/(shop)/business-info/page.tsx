import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { BUSINESS_INFO } from "@/lib/business-info";

// 전자상거래법상 사업자 정보 표시 페이지. business-info.ts 단일 소스에서.

export const metadata = { title: "사업자정보" };

const INFO_ROWS: { label: string; value: string; mono?: boolean }[] = [
  { label: "상호", value: BUSINESS_INFO.name },
  { label: "대표자", value: BUSINESS_INFO.ceo },
  { label: "사업자등록번호", value: BUSINESS_INFO.brn, mono: true },
  {
    label: "통신판매업신고번호",
    value: BUSINESS_INFO.mailOrderLicense,
    mono: true,
  },
  { label: "업태", value: BUSINESS_INFO.businessType },
  { label: "종목", value: BUSINESS_INFO.items },
  { label: "개업일", value: BUSINESS_INFO.openedAt, mono: true },
  { label: "사업장 주소", value: BUSINESS_INFO.address },
  { label: "이메일 문의", value: BUSINESS_INFO.email },
];

// 국세청 사업자등록 상태조회 — 일반인이 사업자번호 진위 확인 가능.
const TAX_LOOKUP_URL =
  "https://teht.hometax.go.kr/websquare/websquare.html?w2xPath=/ui/ab/a/a/UTEABAAA13.xml";

export default function BusinessInfoPage() {
  return (
    <Container className="py-12 md:py-16 max-w-3xl">
      <Heading variant="h2" className="!text-2xl md:!text-3xl">
        사업자정보
      </Heading>
      <p className="mt-2 text-sm text-muted-foreground">
        전자상거래법에 따라 사업자 정보를 안내드립니다.
      </p>

      <section className="mt-10 rounded-2xl bg-card border border-border/50 overflow-hidden">
        <dl className="divide-y divide-border">
          {INFO_ROWS.map(({ label, value, mono }) => (
            <div
              key={label}
              className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-2 px-6 py-4"
            >
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className={mono ? "font-mono text-sm" : "text-sm"}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground leading-relaxed">
        <p>
          사업자등록번호의 진위는 국세청에서 직접 확인하실 수 있습니다.
        </p>
        <a
          href={TAX_LOOKUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-accent-gold hover:text-accent-gold-hover transition-gold font-medium"
        >
          국세청 사업자등록 상태조회 →
        </a>
      </section>

      <p className="mt-10 text-xs text-muted-foreground">
        고객 문의는 {BUSINESS_INFO.email} 로 부탁드립니다.
      </p>
    </Container>
  );
}
