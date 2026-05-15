// localStorage 기반 장바구니. 클라이언트 전용 — SSR에서 호출되면 빈 배열 반환.
// Supabase 영속화는 추후 (로그인 사용자 한정).

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  qty: number;
  selectedOptions: Record<string, string>;
}

const KEY = "gptmall-cart-v1";
const CHANGE_EVENT = "cart:change";

// ──────────────────────────────────────────────────────────
// useSyncExternalStore 호환을 위한 캐시.
// 동일 JSON 문자열이면 동일 배열 참조를 반환 (참조 안정성 보장).
// ──────────────────────────────────────────────────────────
let cachedJson = "";
let cachedItems: CartItem[] = [];

function readSnapshot(): CartItem[] {
  if (typeof window === "undefined") return cachedItems;
  let raw: string;
  try {
    raw = window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    // 시크릿 모드 등 localStorage 차단 시
    return cachedItems;
  }
  if (raw !== cachedJson) {
    try {
      cachedItems = JSON.parse(raw) as CartItem[];
    } catch {
      cachedItems = [];
    }
    cachedJson = raw;
  }
  return cachedItems;
}

function write(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(items);
  try {
    window.localStorage.setItem(KEY, json);
  } catch (e) {
    console.error("[cart] localStorage write 실패", e);
    return;
  }
  cachedJson = json;
  cachedItems = items;
  // 같은 탭의 다른 컴포넌트들이 listen 하는 커스텀 이벤트
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// 옵션 조합까지 포함해 동일 상품 식별. 같은 상품도 옵션 다르면 별개 라인.
const itemKey = (productId: string, opts: Record<string, string>): string =>
  `${productId}|${JSON.stringify(opts)}`;

export function getCart(): CartItem[] {
  return readSnapshot();
}

export function getCartCount(): number {
  return readSnapshot().reduce((n, i) => n + i.qty, 0);
}

export function getCartTotal(): number {
  return readSnapshot().reduce((s, i) => s + i.price * i.qty, 0);
}

export function addToCart(item: Omit<CartItem, "qty"> & { qty?: number }): void {
  const qty = item.qty ?? 1;
  const items = [...readSnapshot()];
  const key = itemKey(item.productId, item.selectedOptions);
  const idx = items.findIndex(
    (i) => itemKey(i.productId, i.selectedOptions) === key
  );
  if (idx >= 0) {
    items[idx] = { ...items[idx], qty: items[idx].qty + qty };
  } else {
    items.push({ ...item, qty });
  }
  write(items);
}

export function updateQty(
  productId: string,
  selectedOptions: Record<string, string>,
  qty: number
): void {
  if (qty <= 0) {
    removeFromCart(productId, selectedOptions);
    return;
  }
  const target = itemKey(productId, selectedOptions);
  const items = readSnapshot().map((i) =>
    itemKey(i.productId, i.selectedOptions) === target ? { ...i, qty } : i
  );
  write(items);
}

export function removeFromCart(
  productId: string,
  selectedOptions: Record<string, string>
): void {
  const target = itemKey(productId, selectedOptions);
  const items = readSnapshot().filter(
    (i) => itemKey(i.productId, i.selectedOptions) !== target
  );
  write(items);
}

export function clearCart(): void {
  write([]);
}

// 훅에서만 사용 — 외부에서 직접 호출 금지.
export const __internal__ = { readSnapshot, CHANGE_EVENT };
