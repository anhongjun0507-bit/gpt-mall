"use client";

import * as React from "react";

import { clearCart } from "@/lib/cart";

// 로그아웃 form 래퍼.
//
// 장바구니는 localStorage 기반이라 서버 Route Handler(/auth/signout)에서 비울 수 없다.
// 제출 직전 클라이언트에서 clearCart() 를 실행해 카트를 비우고,
// form POST 는 그대로 진행시켜 기존 CSRF 안전성(POST-only)을 유지한다.
// (비로그인 → 로그인 흐름에서는 이 컴포넌트가 관여하지 않으므로 카트가 보존된다.)
export function SignOutForm({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  function handleSubmit() {
    try {
      clearCart();
    } catch (e) {
      console.error("[signout] clearCart 실패", e);
      // 카트 정리 실패해도 로그아웃 자체는 진행한다.
    }
  }

  return (
    <form
      action="/auth/signout"
      method="POST"
      onSubmit={handleSubmit}
      className={className}
    >
      {children}
    </form>
  );
}
