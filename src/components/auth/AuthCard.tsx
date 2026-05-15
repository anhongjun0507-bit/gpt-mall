import Link from "next/link";

import { Heading } from "@/components/ui/heading";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

// 인증 페이지 공통 카드 — 상단 로고 시그니처 + 제목 + 본문.
export function AuthCard({ title, description, children }: Props) {
  return (
    <div className="w-full">
      {/* 상단 로고 — 외부에서 잘 보이는 위치 */}
      <Link href="/" className="flex items-center justify-center gap-2 mb-8">
        <span className="text-h4 font-extrabold tracking-tight text-foreground">
          디지털스토어
        </span>
        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
      </Link>

      {/* 카드 본문 */}
      <div className="rounded-2xl bg-card border border-border/60 shadow-sm p-8 sm:p-10">
        <Heading variant="h3" as="h1" className="text-center">
          {title}
        </Heading>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground text-center">
            {description}
          </p>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
