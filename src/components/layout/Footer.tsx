import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Container } from "@/components/ui/container";
import { BUSINESS_INFO } from "@/lib/business-info";

const KAKAO_CHANNEL_URL = "https://pf.kakao.com/_xhHWgn";

const SHOP_LINKS = [
  { label: "전체 상품", href: "/products" },
  { label: "신상품", href: "/products?sort=new" },
  { label: "인기 상품", href: "/products?sort=popular" },
] as const;

interface HelpLink {
  label: string;
  href: string;
  external?: boolean;
}

const HELP_LINKS: HelpLink[] = [
  { label: "카카오톡 문의", href: KAKAO_CHANNEL_URL, external: true },
  { label: "환불 정책", href: "/terms" },
];

const LEGAL_LINKS = [
  { label: "이용약관", href: "/terms" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "사업자정보", href: "/business-info" },
] as const;

// 전자상거래법상 필수 표시 항목. business-info.ts 단일 소스에서 가져온다.
// 전화번호는 운영하지 않아 표기 X — 문의는 이메일로만.
const COMPANY_INFO: { label: string; value: string }[] = [
  { label: "상호", value: BUSINESS_INFO.name },
  { label: "대표자", value: BUSINESS_INFO.ceo },
  { label: "사업자등록번호", value: BUSINESS_INFO.brn },
  { label: "통신판매업신고번호", value: BUSINESS_INFO.mailOrderLicense },
  { label: "주소", value: BUSINESS_INFO.address },
  { label: "이메일 문의", value: BUSINESS_INFO.email },
];

const SOCIAL_LINKS = [
  { label: "카카오톡 채널", href: KAKAO_CHANNEL_URL, Icon: MessageCircle },
] as const;

export function Footer() {
  return (
    <footer className="bg-footer-bg text-footer-foreground py-16 md:py-24">
      <Container>
        {/* ─── 4열 그리드 (모바일 1열, md 이상 4열) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* 1열: 브랜드 */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="text-h4 font-extrabold tracking-tight">
                {BUSINESS_INFO.name}
              </span>
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full bg-accent-gold"
              />
            </div>
            <p className="text-body text-footer-foreground/70 leading-relaxed">
              프리미엄 AI 소프트웨어 라이센스 정식 판매
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-footer-foreground/15 text-footer-foreground/70 hover:text-accent-gold hover:border-accent-gold transition-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* 2열: Shop */}
          <div className="flex flex-col gap-5">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-footer-foreground/90">
              Shop
            </h3>
            <ul className="flex flex-col gap-3">
              {SHOP_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-body text-footer-foreground/70 hover:text-accent-gold transition-gold"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3열: Help */}
          <div className="flex flex-col gap-5">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-footer-foreground/90">
              Help
            </h3>
            <ul className="flex flex-col gap-3">
              {HELP_LINKS.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body text-footer-foreground/70 hover:text-accent-gold transition-gold"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-body text-footer-foreground/70 hover:text-accent-gold transition-gold"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* 4열: 회사 정보 */}
          <div className="flex flex-col gap-5">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-footer-foreground/90">
              Company
            </h3>
            <dl className="flex flex-col gap-1.5 text-xs text-footer-foreground/60 leading-relaxed">
              {COMPANY_INFO.map(({ label, value }) => (
                <div key={label} className="flex gap-2">
                  <dt className="shrink-0 text-footer-foreground/40">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* ─── 하단 카피라이트 + 법적 고지 ─── */}
        <div className="mt-12 pt-8 border-t border-footer-foreground/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm leading-[1.4] text-footer-foreground/50">
            © 2026 {BUSINESS_INFO.name}. All rights reserved.
          </p>
          <nav className="flex items-center gap-6 flex-wrap" aria-label="법적 고지">
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm leading-[1.4] text-footer-foreground/60 hover:text-accent-gold transition-gold"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
