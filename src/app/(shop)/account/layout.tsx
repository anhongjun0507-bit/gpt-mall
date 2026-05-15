import { Container } from "@/components/ui/container";
import { requireUser } from "@/lib/auth";
import { AccountSidebar } from "@/components/account/AccountSidebar";

// 마이페이지 영역 — 로그인 필수. Header/Footer 는 (shop) 그룹 layout 이 처리.
// next 는 layout 레벨 default 로 /account. 더 정확한 경로가 필요한 페이지는
// 자체적으로 requireUser({ next: ... }) 를 한 번 더 호출하면 된다.
export default async function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser({ next: "/account" });

  return (
    <Container className="py-10 lg:py-14">
      {/* 인사 헤더 */}
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">안녕하세요!</p>
        <p className="mt-1 font-medium">{user.email}</p>
      </header>

      <div className="grid lg:grid-cols-[14rem_1fr] gap-8 items-start">
        <AccountSidebar />
        <main className="min-w-0">{children}</main>
      </div>
    </Container>
  );
}
