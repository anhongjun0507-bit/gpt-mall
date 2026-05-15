import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// 관리자 레이아웃 — Header/Footer 없이 사이드바 + 우측 컨텐츠.
// 미들웨어 가드 + page-level requireAdmin() 두 단계로 보호.
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1 bg-background overflow-y-auto">
        <div className="px-8 py-10 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
