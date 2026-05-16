import Link from "next/link";

import { Container } from "@/components/ui/container";

// 인증 페이지(/login, /signup, /reset-password, /forgot-password)용 미니멀 헤더.
// 로고만 노출 — 회원가입·로그인 화면에서 다른 메뉴로 이탈 가능성 최소화.
export function AuthHeader() {
  return (
    <header className="border-b border-border/60 bg-background/95 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="디지털스토어 홈"
          >
            <span className="text-h4 font-extrabold tracking-tight text-foreground">
              디지털스토어
            </span>
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full bg-accent-gold transition-gold group-hover:bg-accent-gold-hover"
            />
          </Link>
        </div>
      </Container>
    </header>
  );
}
