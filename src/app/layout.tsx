import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "디지털스토어 — 프리미엄 AI 소프트웨어 라이센스",
    template: "%s | 디지털스토어",
  },
  description: "공식 라이센스, 즉시 발급. AI 시대의 모든 도구를 한 곳에서.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "디지털스토어",
    title: "디지털스토어 — 프리미엄 AI 소프트웨어 라이센스",
    description: "공식 라이센스, 즉시 발급. AI 시대의 모든 도구를 한 곳에서.",
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
        {/* Pretendard Variable — CDN 직접 로드 */}
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
