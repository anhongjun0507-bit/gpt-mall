// 상품 정렬 — 서버(products/page.tsx)와 클라이언트(ProductSort.tsx) 공용 모듈.
// ProductSort 가 "use client" 라 거기서 export 하면 서버 컴포넌트가 import 할 때
// client-reference 프록시로 치환돼 SORT_OPTIONS 의 `in`/키 조회가 깨진다.
// 순수 데이터라 별도 모듈로 분리해 양쪽에서 안전하게 쓴다.

export const SORT_OPTIONS = {
  recommended: "추천순",
  latest: "최신순",
  price_asc: "낮은 가격순",
  price_desc: "높은 가격순",
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

// 기본 정렬 — 홈 "지금 가장 인기있는" 과 동일한 sort_order 오름차순.
export const DEFAULT_SORT: SortKey = "recommended";

// 정렬 키 → Postgres order 컬럼. 동점 시 created_at DESC 로 tie-break (page.tsx).
export const SORT_QUERY: Record<SortKey, { column: string; ascending: boolean }> = {
  recommended: { column: "sort_order", ascending: true },
  latest: { column: "created_at", ascending: false },
  price_asc: { column: "price", ascending: true },
  price_desc: { column: "price", ascending: false },
};
