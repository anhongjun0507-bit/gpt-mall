"use client";

import * as React from "react";
import { Check, Copy, Landmark } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatKRW } from "@/lib/format";
import {
  BANK_ACCOUNT,
  BANK_ACCOUNT_LINE,
  formatDepositDue,
  isDepositOverdue,
} from "@/lib/bank-account";

interface Props {
  total: number;
  depositorName: string | null;
  depositDueAt: string | null;
  className?: string;
}

// 입금 안내 카드 — 주문 완료 페이지와 마이페이지 주문 상세가 공유한다.
// 고객이 나중에 다시 들어와도 같은 정보를 그대로 볼 수 있어야 해서 컴포넌트로 분리.
export function DepositGuide({
  total,
  depositorName,
  depositDueAt,
  className,
}: Props) {
  const [copied, setCopied] = React.useState(false);
  const overdue = isDepositOverdue(depositDueAt);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(BANK_ACCOUNT_LINE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("[DepositGuide] 계좌 복사 실패", e);
    }
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-accent-gold/40 bg-accent-gold/5 p-6",
        className
      )}
    >
      <header className="flex items-center gap-2">
        <Landmark className="h-5 w-5 text-accent-gold" />
        <h3 className="text-h4 font-semibold">입금 안내</h3>
      </header>

      {/* 계좌 — 가장 크게 */}
      <div className="mt-4 rounded-xl bg-background border border-border/60 p-5">
        <p className="text-xs text-muted-foreground">입금 계좌</p>
        <p className="mt-1.5 text-lg md:text-xl font-bold tabular-nums break-all">
          {BANK_ACCOUNT.bank} {BANK_ACCOUNT.number}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          예금주 · {BANK_ACCOUNT.holder}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="mt-3 inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-sm font-medium hover:border-accent-gold hover:text-accent-gold transition-all duration-200"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              계좌번호 복사
            </>
          )}
        </button>
      </div>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">입금 금액</dt>
          <dd className="font-bold text-accent-gold tabular-nums">
            {formatKRW(total)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">입금자명</dt>
          <dd className="font-medium">{depositorName ?? "-"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">입금 기한</dt>
          <dd className={cn("font-medium", overdue && "text-destructive")}>
            {depositDueAt ? formatDepositDue(depositDueAt) : "-"}
            {overdue && " (기한 초과)"}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
        {overdue
          ? "입금 기한이 지났습니다. 입금 전이라면 카카오톡 채널로 문의해주세요."
          : "입금 확인 후 카카오톡으로 계정 정보를 보내드립니다. 기한 내 미입금 시 주문이 취소될 수 있습니다."}
      </p>
    </section>
  );
}
