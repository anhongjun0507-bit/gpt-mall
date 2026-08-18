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
  // 배포 전이라 검색엔진 인덱싱 차단. 정식 오픈 시 제거.
  robots: { index: false, follow: false },
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
