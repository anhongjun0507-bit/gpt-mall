import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { safeRedirect } from "@/lib/safe-redirect";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";
import { OrDivider, SocialButtons } from "@/components/auth/SocialButtons";

export const metadata = { title: "회원가입" };

interface PageProps {
  searchParams: { next?: string };
}

export default async function SignupPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const next = safeRedirect(searchParams.next);
  if (user) redirect(next);

  return (
    <AuthCard
      title="회원가입"
      description="이메일로 30초만에 시작하기"
    >
      <SocialButtons next={next} />
      <OrDivider />
      <SignupForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{" "}
        <Link
          href={`/login${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ""}`}
          className="text-accent-gold font-semibold hover:text-accent-gold-hover transition-gold"
        >
          로그인
        </Link>
      </p>
    </AuthCard>
  );
}
