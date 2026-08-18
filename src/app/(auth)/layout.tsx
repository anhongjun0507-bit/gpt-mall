import { AuthHeader } from "@/components/layout/AuthHeader";
import { Footer } from "@/components/layout/Footer";

import type { Metadata } from "next";

// 로그인·회원가입 등 인증 화면은 검색 노출 대상이 아니다. 전역 noindex 해제 후에도
// 이 구간이 인덱싱되지 않도록 라우트 그룹 레이아웃에 noindex 를 이중으로 건다.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// (auth) 라우트 그룹 공통 레이아웃 — 로고만 있는 미니멀 헤더로 폼 집중도 강화.
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <main className="flex-1 flex items-center justify-center bg-secondary/30 px-4 py-12 md:py-20">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
