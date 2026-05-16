import { Users as UsersIcon } from "lucide-react";

import { Heading } from "@/components/ui/heading";

export const metadata = { title: "회원 관리" };

// 회원 관리는 추후 확장 예정 — sidebar 의 "회원" 링크 종착지 stub.
// PRD 기준 인증 플로우(가입/로그인) 완성 후 본격 구현.
export default function AdminUsersPage() {
  return (
    <>
      <Heading variant="h2" className="!text-2xl">
        회원 관리
      </Heading>

      <div className="mt-8 rounded-2xl bg-card border border-border/50 p-6 sm:p-12 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-accent-gold/10 flex items-center justify-center">
          <UsersIcon className="h-6 w-6 text-accent-gold" />
        </div>
        <Heading variant="h3" as="p" className="mt-6">
          회원 관리 — 준비 중
        </Heading>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          회원 목록 조회, 권한 변경(admin 승격), 회원 비활성화 등 기능이 인증 플로우 완성 후 제공될 예정입니다.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          그 전까지는 admin 승격이 필요한 경우 Supabase Dashboard SQL Editor에서
          직접 처리해주세요.
        </p>
      </div>
    </>
  );
}
