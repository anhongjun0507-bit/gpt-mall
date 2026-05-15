"use client";

import { useSyncExternalStore } from "react";

import { __internal__, type CartItem } from "@/lib/cart";

const EMPTY: CartItem[] = [];

function subscribe(cb: () => void): () => void {
  // 다른 탭의 변경은 native storage 이벤트로
  window.addEventListener("storage", cb);
  // 같은 탭의 변경은 커스텀 이벤트로 (storage 이벤트는 같은 탭에서 안 터짐)
  window.addEventListener(__internal__.CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(__internal__.CHANGE_EVENT, cb);
  };
}

const getServerSnapshot = (): CartItem[] => EMPTY;

export function useCart() {
  const items = useSyncExternalStore(
    subscribe,
    __internal__.readSnapshot,
    getServerSnapshot
  );

  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return { items, count, total };
}
