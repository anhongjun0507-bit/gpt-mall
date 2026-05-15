import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { safeRedirect } from "@/lib/safe-redirect";
import { AuthCard } from "@/components/auth/AuthCard";
import { EmailLoginForm } from "@/components/auth/EmailLoginForm";
import { OrDivider, SocialButtons } from "@/components/auth/SocialButtons";

export const metadata = { title: "로그인" };

interface PageProps {
  searchParams: { next?: string; reset?: string; error?: string };
}

// 네이버 OAuth 흐름 중 발생할 수 있는 에러 → 사용자에게 보일 메시지.
const NAVER_ERROR_MESSAGES: Record<string, string> = {
  naver_unavailable:
    "네이버 로그인이 아직 활성화되지 않았어요. 잠시 후 다시 시도해주세요.",
  naver_state_mismatch:
    "로그인 시도가 유효하지 않아요. 처음부터 다시 시도해주세요.",
  naver_email_required:
    "네이버 가입에는 이메일 동의가 필요해요. 동의 후 다시 시도해주세요.",
  naver_access_denied: "네이버 로그인이 취소되었어요.",
  naver_failed:
    "네이버 로그인 처리 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
};

export default async function LoginPage({ searchParams }: PageProps) {
  // 이미 로그인된 상태로 진입 시 → next 또는 홈으로 즉시 리다이렉트
  const user = await getCurrentUser();
  const next = safeRedirect(searchParams.next);
  if (user) redirect(next);

  // 비밀번호 변경 후 도착한 경우 안내 메시지 표시
  const fromReset = searchParams.reset === "1";

  // OAuth 흐름 에러
  const errorKey = typeof searchParams.error === "string" ? searchParams.error : null;
  const naverError = errorKey && errorKey.startsWith("naver_")
    ? NAVER_ERROR_MESSAGES[errorKey] ??
      "네이버 로그인 처리 중 오류가 발생했어요."
    : null;

  return (
    <AuthCard
      title="로그인"
      description="디지털스토어에 오신 것을 환영합니다"
    >
      {fromReset && (
        <p className="mb-6 text-sm text-accent-gold bg-accent-gold/10 border border-accent-gold/30 rounded-md px-3 py-2">
          비밀번호가 변경되었어요. 새 비밀번호로 로그인해주세요.
        </p>
      )}

      {naverError && (
        <p className="mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {naverError}
        </p>
      )}

      <SocialButtons next={next} />
      <OrDivider />
      <EmailLoginForm next={next} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        아직 회원이 아니신가요?{" "}
        <Link
          href={`/signup${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ""}`}
          className="text-accent-gold font-semibold hover:text-accent-gold-hover transition-gold"
        >
          회원가입
        </Link>
      </p>
    </AuthCard>
  );
}
