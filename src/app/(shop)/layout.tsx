import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { Footer } from "@/components/layout/Footer";

// (shop) 라우트 그룹 — 일반 사용자가 보는 모든 페이지.
// HeaderWrapper 가 서버 측에서 user/profile 조회 후 Header 에 전달.
export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWrapper />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
