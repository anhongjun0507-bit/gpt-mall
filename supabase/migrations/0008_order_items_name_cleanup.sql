-- ────────────────────────────────────────────────────────────────────
-- 기존 order_items.product_name 스냅샷 정리
--
-- 배경: 0007 에서 products.name 의 trailing "N개월" 을 제거했지만,
-- order_items.product_name 은 주문 시점 스냅샷이라 기존 주문엔 여전히
-- "Claude Pro 1개월" 같은 옛 형식이 박혀 있다. 옵션이 "기간: 3개월" 인데
-- 이름도 "1개월" 이면 사용자가 혼란.
--
-- 정리:
--   selected_options 에 기간(또는 기타) 옵션이 있는 행에 한해
--   product_name 의 trailing "N개월" 만 제거. 가격(price) 은 건드리지 않음.
--
-- 안전:
--   - selected_options 가 비어있는 row 는 제외 (이름에 박힌 기간이 유일한 정보)
--   - 가격 컬럼 미수정 → 영수증/회계 영향 X
-- ────────────────────────────────────────────────────────────────────

update public.order_items
set product_name = regexp_replace(product_name, '\s*\d+\s*개월\s*$', '')
where product_name ~ '\s+\d+\s*개월\s*$'
  and selected_options is not null
  and selected_options <> '{}'::jsonb;
