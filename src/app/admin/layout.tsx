import { requireAdmin } from "@/lib/auth";
import { AdminSidebar, AdminMobileHeader } from "@/components/admin/AdminSidebar";

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
