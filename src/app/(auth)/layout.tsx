import { AuthHeader } from "@/components/layout/AuthHeader";
import { Footer } from "@/components/layout/Footer";

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
