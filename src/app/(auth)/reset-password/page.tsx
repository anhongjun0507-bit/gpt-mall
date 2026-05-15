import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "새 비밀번호 설정" };

// /auth/callback 에서 recovery 코드 교환 후 이 페이지로 옴.
// 도착한 사용자는 일시적으로 인증된 상태 (Supabase 'recovery' 세션).
// updateUser({password}) 호출 가능.
export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="새 비밀번호 설정"
      description="새로운 비밀번호를 입력해주세요"
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
