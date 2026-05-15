"use client";

import { useCart } from "@/hooks/useCart";

// 헤더의 ShoppingBag 아이콘 위에 절대배치되는 카트 카운트 배지.
// 카트가 비어 있으면 렌더하지 않음 (시각적 노이즈 제거).
export function CartBadge() {
  const { count } = useCart();
  if (count === 0) return null;
  return (
    <span
      aria-hidden
      className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-gold px-1 text-[10px] font-bold text-foreground"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
