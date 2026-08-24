import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";
import { BUSINESS_INFO } from "@/lib/business-info";

const SITE_TITLE = "디지털스토어 — 유튜브 프리미엄·제미나이 Pro 구독 공유";
const SITE_DESCRIPTION =
  "유튜브 프리미엄, 제미나이 Pro 등 인기 구독 서비스를 함께 쓰는 계정으로 이용하실 수 있게 중개해 드립니다. 주문 확인 후 계정 정보를 빠르게 안내드립니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | 디지털스토어",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "디지털스토어",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  // 공개 페이지는 색인 허용 — 기본값에 기대지 않고 명시한다.
  // 비공개 구간(admin·account·cart·checkout·order·auth)은 각 layout/page 의
  // 개별 robots 메타가 계속 noindex 를 덮어쓴다.
  robots: { index: true, follow: true },
  // 서치콘솔·서치어드바이저 소유확인 메타. env 미설정이면 태그 자체가 안 나간다.
  // HTML 파일 방식은 src/lib/site-verification.ts 참조 — 둘 중 아무거나 쓰면 된다.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    ...(process.env.NAVER_SITE_VERIFICATION
      ? { other: { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION } }
      : {}),
  },
};

// 사이트 전역 구조화 데이터.
// Organization — 개인사업자라 "(주)" 표기 금지, BUSINESS_INFO 그대로 사용.
// WebSite — 사이트에 검색 기능이 없어 SearchAction 은 의도적으로 넣지 않는다.
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BUSINESS_INFO.name,
  url: SITE_URL,
  logo: `${SITE_URL}/og.png`,
  email: BUSINESS_INFO.email,
  address: {
    "@type": "PostalAddress",
    addressCountry: "KR",
    streetAddress: BUSINESS_INFO.address,
  },
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BUSINESS_INFO.siteName,
  url: SITE_URL,
  inLanguage: "ko-KR",
};

// 루트 레이아웃은 최소화 — Pretendard, Toaster, html/body 만.
// Header/Footer 는 (shop) 라우트 그룹의 자체 layout 에서 처리.
// admin 라우트는 사이드바를 가진 별도 layout.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard Variable — CDN 직접 로드.
            preconnect 로 DNS/TLS 핸드셰이크 선행 → 폰트 첫 페인트 단축. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        <JsonLd data={ORGANIZATION_LD} />
        <JsonLd data={WEBSITE_LD} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
