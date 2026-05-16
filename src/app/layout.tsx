import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  metadataBase: new URL("https://digitalst.kr"),
  title: {
    default: "디지털스토어 — 프리미엄 AI 소프트웨어 라이센스",
    template: "%s | 디지털스토어",
  },
  description:
    "AI 소프트웨어 라이센스 정식 판매. 공식 라이센스, 즉시 발급. 안전한 결제와 빠른 발급으로 AI 도구를 시작하세요.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "디지털스토어",
    title: "디지털스토어 — 프리미엄 AI 소프트웨어 라이센스",
    description:
      "AI 소프트웨어 라이센스 정식 판매. 공식 라이센스, 즉시 발급.",
    url: "https://digitalst.kr",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "디지털스토어 — 프리미엄 AI 소프트웨어 라이센스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "디지털스토어 — 프리미엄 AI 소프트웨어 라이센스",
    description:
      "AI 소프트웨어 라이센스 정식 판매. 공식 라이센스, 즉시 발급.",
    images: ["/og.svg"],
  },
  // 배포 전이라 검색엔진 인덱싱 차단. 정식 오픈 시 제거.
  robots: { index: false, follow: false },
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
