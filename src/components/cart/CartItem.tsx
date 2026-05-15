"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatKRW } from "@/lib/format";
import { updateQty, removeFromCart, type CartItem as CartItemData } from "@/lib/cart";

interface Props {
  item: CartItemData;
}

// 장바구니 한 줄 — 이미지 / 정보 / 수량+소계+삭제.
export function CartItem({ item }: Props) {
  const subtotal = item.price * item.qty;
  const optionsText = Object.entries(item.selectedOptions)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");

  return (
    <div className="flex gap-4 py-6 border-b border-border last:border-b-0">
      {/* 이미지 */}
      <Link
        href={`/products/${item.slug}`}
        className="w-24 h-24 rounded-xl bg-secondary overflow-hidden shrink-0 transition-opacity duration-200 hover:opacity-90"
      >
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </Link>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.slug}`}
          className="font-semibold text-foreground hover:text-accent-gold transition-gold line-clamp-2"
        >
          {item.name}
        </Link>
        {optionsText && (
          <p className="mt-1 text-xs text-muted-foreground">{optionsText}</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground tabular-nums">
          단가 {formatKRW(item.price)}
        </p>
      </div>

      {/* 액션 */}
      <div className="flex flex-col items-end gap-3 shrink-0">
        {/* 수량 조절 */}
        <div className="inline-flex h-9 items-center rounded-md border border-border overflow-hidden">
          <button
            type="button"
            onClick={() =>
              updateQty(item.productId, item.selectedOptions, item.qty - 1)
            }
            disabled={item.qty <= 1}
            aria-label="수량 감소"
            className={cn(
              "w-9 h-full flex items-center justify-center hover:bg-secondary transition-colors duration-200",
              item.qty <= 1 && "opacity-40 cursor-not-allowed"
            )}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center font-semibold tabular-nums text-sm">
            {item.qty}
          </span>
          <button
            type="button"
            onClick={() =>
              updateQty(item.productId, item.selectedOptions, item.qty + 1)
            }
            aria-label="수량 증가"
            className="w-9 h-full flex items-center justify-center hover:bg-secondary transition-colors duration-200"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 소계 */}
        <p className="font-bold text-lg tabular-nums">{formatKRW(subtotal)}</p>

        {/* 삭제 */}
        <button
          type="button"
          onClick={() => removeFromCart(item.productId, item.selectedOptions)}
          aria-label={`${item.name} 삭제`}
          className="text-muted-foreground hover:text-destructive transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
