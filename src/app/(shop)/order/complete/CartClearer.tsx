"use client";

import { useEffect } from "react";

import { clearCart } from "@/lib/cart";

// 주문 완료 페이지 진입 시 localStorage 카트를 1회 비운다.
// 새로고침/뒤로가기 재진입에도 안전 — 이미 비어있으면 no-op.
export function CartClearer() {
  useEffect(() => {
    try {
      clearCart();
    } catch (e) {
      console.error("[order/complete] clearCart 실패", e);
    }
  }, []);
  return null;
}
