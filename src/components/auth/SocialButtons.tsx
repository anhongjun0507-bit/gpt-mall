"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { createClient } from "@/lib/supabase/client";
import { getSiteUrl, safeRedirect } from "@/lib/safe-redirect";

// 카카오 아이콘 — lucide 에 없어서 인라인 SVG.
function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.85 1.93 5.34 4.8 6.72-.21.78-.78 2.87-.9 3.32-.15.56.21.55.43.4.18-.12 2.79-1.9 3.93-2.68.57.08 1.15.13 1.74.13 5.52 0 10-3.48 10-7.79S17.52 3 12 3z" />
    </svg>
  );
}

// 네이버 아이콘.
function NaverIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M14.07 12.06L9.93 6H6v12h3.93V11.94L14.07 18H18V6h-3.93v6.06z" />
    </svg>
  );
}

interface Props {
  next?: string;
}

// 소셜 로그인 버튼.
//   카카오: Supabase 의 'kakao' provider 사용. Supabase 대시보드에서 활성화 + 키 입력 필요.
//          (docs/AUTH_SETUP.md 참조)
//   네이버: Supabase 미지원이라 커스텀 OAuth 구현 필요 — 향후 작업, 일단 "준비 중".
export function SocialButtons({ next }: Props = {}) {
  const [kakaoPending, setKakaoPending] = React.useState(false);
  const redirectNext = safeRedirect(next, "/");

  async function handleKakao() {
    setKakaoPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(redirectNext)}`,
        },
      });
      if (error) {
        // 가장 흔한 케이스: provider 미활성화 → 친절히 안내
        const friendly = error.message.includes("provider is not enabled")
          ? "카카오 로그인이 아직 활성화되지 않았어요. 클라이언트가 카카오 OAuth 키를 등록한 뒤 사용 가능합니다."
          : error.message;
        toast({
          title: "카카오 로그인 실패",
          description: friendly,
          variant: "destructive",
        });
        setKakaoPending(false);
      }
      // 성공 시 supabase 가 카카오로 navigate — setPending false 안 됨 (페이지 떠남)
    } catch (e) {
      console.error("[SocialButtons] 카카오 실패", e);
      toast({ title: "오류가 발생했어요", variant: "destructive" });
      setKakaoPending(false);
    }
  }

  function handleNaver() {
    toast({
      title: "네이버 로그인 준비 중",
      description:
        "Supabase 기본 미지원이라 별도 커스텀 OAuth 구현 예정입니다. 우선 카카오 또는 이메일을 사용해주세요.",
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleKakao}
        disabled={kakaoPending}
        className="w-full h-12 rounded-md font-semibold inline-flex items-center justify-center gap-2 bg-[#FEE500] text-black hover:bg-[#FEE500]/90 disabled:opacity-60 transition-colors duration-200"
      >
        {kakaoPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <KakaoIcon className="w-5 h-5" />
        )}
        카카오로 시작하기
      </button>
      <button
        type="button"
        onClick={handleNaver}
        className="w-full h-12 rounded-md font-semibold inline-flex items-center justify-center gap-2 bg-[#03C75A] text-white hover:bg-[#03C75A]/90 transition-colors duration-200"
      >
        <NaverIcon className="w-5 h-5" />
        네이버로 시작하기
      </button>
    </div>
  );
}

// "또는" 구분선 — 폼들에서 재사용.
export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3" aria-hidden>
      <span className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground">또는</span>
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}
