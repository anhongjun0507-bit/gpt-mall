import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Container } from "@/components/ui/container";

// Lucide v1.x 부터 브랜드 아이콘이 제거돼 인라인 SVG 사용.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  );
}

// 풋터 네비게이션 그룹 — 컬럼별 메뉴
const SHOP_LINKS = [
  { label: "전체 상품", href: "/products" },
  { label: "신상품", href: "/products?sort=new" },
  { label: "인기 상품", href: "/products?sort=popular" },
] as const;

const HELP_LINKS = [
  { label: "자주 묻는 질문", href: "/help/faq" },
  { label: "1:1 문의", href: "/help/contact" },
  { label: "환불 정책", href: "/help/refund" },
] as const;

// 회사 정보 — 추후 실제 데이터로 교체 (사업자 정보)
const COMPANY_INFO = [
  { label: "상호", value: "디지털스토어" },
  { label: "대표자", value: "이현석" },
  { label: "사업자등록번호", value: "000-00-00000" },
  { label: "통신판매업신고번호", value: "제0000-서울-0000호" },
  { label: "주소", value: "서울특별시 강남구" },
  { label: "고객센터", value: "02-0000-0000" },
  { label: "이메일", value: "support@digitalst.kr" },
] as const;

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "카카오톡 채널", href: "#", Icon: MessageCircle },
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
                디지털스토어
              </span>
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full bg-accent-gold"
              />
            </div>
            <p className="text-body text-footer-foreground/70 leading-relaxed">
              프리미엄 AI 소프트웨어 라이센스
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
              {HELP_LINKS.map(({ label, href }) => (
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

        {/* ─── 하단 카피라이트 ─── */}
        <div className="mt-12 pt-8 border-t border-footer-foreground/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm leading-[1.4] text-footer-foreground/50">
            © 2026 디지털스토어. All rights reserved.
          </p>
          <nav className="flex items-center gap-6" aria-label="법적 고지">
            <Link
              href="/legal/terms"
              className="text-sm leading-[1.4] text-footer-foreground/60 hover:text-accent-gold transition-gold"
            >
              이용약관
            </Link>
            <Link
              href="/legal/privacy"
              className="text-sm leading-[1.4] text-footer-foreground/60 hover:text-accent-gold transition-gold"
            >
              개인정보처리방침
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
