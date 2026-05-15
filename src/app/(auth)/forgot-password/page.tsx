import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "비밀번호 찾기" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="비밀번호 찾기"
      description="가입하신 이메일로 재설정 링크를 보내드려요"
    >
      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        비밀번호가 기억나셨나요?{" "}
        <Link
          href="/login"
          className="text-accent-gold font-semibold hover:text-accent-gold-hover transition-gold"
        >
          로그인
        </Link>
      </p>
    </AuthCard>
  );
}
