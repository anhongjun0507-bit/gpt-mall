import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "새 비밀번호 설정" };

// /auth/callback 에서 recovery 코드 교환 후 이 페이지로 옴.
// 도착한 사용자는 일시적으로 인증된 상태 (Supabase 'recovery' 세션).
// 직접 URL 만 치고 들어오면 세션이 없으므로 폼을 노출하지 않고 안내.
export default async function ResetPasswordPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const hasSession = Boolean(data?.user);

  if (!hasSession) {
    return (
      <AuthCard
        title="잘못된 접근입니다"
        description="비밀번호 재설정 메일의 링크를 통해서만 이 페이지에 접근할 수 있어요."
      >
        <div className="space-y-3 text-sm">
          <Link
            href="/forgot-password"
            className="block w-full h-12 rounded-md bg-accent-gold text-footer-bg font-semibold inline-flex items-center justify-center hover:bg-accent-gold-hover transition-colors duration-200"
          >
            비밀번호 찾기
          </Link>
          <Link
            href="/login"
            className="block text-center text-muted-foreground hover:text-accent-gold transition-gold"
          >
            로그인으로
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="새 비밀번호 설정"
      description="새로운 비밀번호를 입력해주세요"
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
