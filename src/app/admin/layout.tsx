import { requireAdmin } from "@/lib/auth";
import { AdminSidebar, AdminMobileHeader } from "@/components/admin/AdminSidebar";

import type { Metadata } from "next";

// 관리자 구간은 어떤 경우에도 검색 노출 금지. 미들웨어 가드와 별개로
// 전역 noindex 해제 시나리오까지 대비해 레이아웃에 noindex 명시.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// 관리자 레이아웃 — 데스크탑은 좌측 사이드바, 모바일은 상단 헤더 + drawer.
// 미들웨어 가드 + page-level requireAdmin() 두 단계로 보호.
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <div className="min-h-screen lg:flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col bg-background">
        <AdminMobileHeader />
        <main className="flex-1 overflow-x-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-10 max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
