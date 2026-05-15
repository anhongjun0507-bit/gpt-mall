import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { Footer } from "@/components/layout/Footer";

// (auth) 라우트 그룹 공통 레이아웃. Header/Footer 는 유지하되 main 중앙 정렬.
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWrapper />
      <main className="flex-1 flex items-center justify-center bg-secondary/30 px-4 py-12 md:py-20">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
