// 주문 아이템 표시용 헬퍼.
// 상품명과 selected_options 를 합쳐 "Claude Pro · 기간 3개월" 같은
// 단일 라벨/부제 쌍으로 만들어 모든 화면에서 동일하게 사용.
//
// 옵션 없는 상품은 product_name 그대로, 부제는 빈 문자열.
// 옵션 키가 한국어/영문 무엇이든 동일하게 처리한다.

export type SelectedOptions = Record<string, string> | null | undefined;

export function formatSelectedOptions(opts: SelectedOptions): string {
  if (!opts) return "";
  const entries = Object.entries(opts).filter(
    ([, v]) => typeof v === "string" && v.length > 0
  );
  if (entries.length === 0) return "";
  return entries.map(([k, v]) => `${k} ${v}`).join(" · ");
}

// 마이페이지 목록처럼 한 줄로 보여줘야 할 때.
// 예: "Claude Pro · 기간 3개월"
export function formatOrderItemTitle(
  productName: string,
  opts: SelectedOptions
): string {
  const sub = formatSelectedOptions(opts);
  return sub ? `${productName} · ${sub}` : productName;
}
