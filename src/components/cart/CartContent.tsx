"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { formatKRW } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import { clearCart } from "@/lib/cart";

import { CartItem } from "./CartItem";

export function CartContent() {
  const { items, count, total } = useCart();

  // ─── 빈 상태 ────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <Heading variant="h3" as="p" className="mt-6">
          장바구니가 비어있습니다
        </Heading>
        <p className="mt-3 text-muted-foreground">
          마음에 드는 상품을 담아보세요.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/products">
            상품 둘러보기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  // ─── 아이템 있을 때 ─────────────────────────────────────
  return (
    <div className="mt-8 grid lg:grid-cols-3 gap-8">
      {/* 좌측: 아이템 리스트 */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl bg-card border border-border/60 px-6">
          {items.map((it) => (
            <CartItem
              key={`${it.productId}|${JSON.stringify(it.selectedOptions)}`}
              item={it}
            />
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (confirm("장바구니를 비울까요?")) clearCart();
            }}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors duration-200"
          >
            전체 삭제
          </button>
        </div>
      </div>

      {/* 우측: 주문 요약 (sticky) */}
      <aside className="lg:col-span-1">
        <div className="lg:sticky lg:top-24 rounded-2xl bg-card border border-border/60 p-6">
          <h2 className="text-h4 font-semibold">주문 요약</h2>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                상품 합계 <span className="tabular-nums">({count}개)</span>
              </dt>
              <dd className="tabular-nums">{formatKRW(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">배송비</dt>
              <dd className="text-muted-foreground">무료</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">할인</dt>
              <dd className="text-muted-foreground">-</dd>
            </div>
          </dl>

          <div className="my-5 h-px bg-border" />

          <div className="flex items-baseline justify-between">
            <span className="font-semibold">총 결제금액</span>
            <span className="text-2xl font-bold text-accent-gold tabular-nums">
              {formatKRW(total)}
            </span>
          </div>

          <Button asChild size="lg" className="w-full h-12 mt-6">
            <Link href="/checkout">
              주문하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <p className="mt-4 text-xs text-muted-foreground text-center leading-relaxed">
            디지털 상품은 결제 완료 후
            <br />
            즉시 발송됩니다
          </p>
        </div>
      </aside>
    </div>
  );
}
