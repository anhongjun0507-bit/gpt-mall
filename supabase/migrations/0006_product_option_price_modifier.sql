-- ────────────────────────────────────────────────────────────────────
-- products.options.values 구조 변경
--   기존: string[] (예: ["1개월", "3개월", "6개월"])
--   변경: [{ label: string, price_modifier: number }, ...]
--
-- price_modifier 는 products.price (기본 가격) 에 더하는 금액 (음수 허용).
-- 모든 기존 row 는 price_modifier = 0 으로 초기화 — 가격 차이 없음 보존.
-- 옵션이 비어있는 row (values: []) 는 그대로 통과.
--
-- 안전 장치: 마이그레이션 직전 백업 `products_backup_20260515` 생성 완료.
-- ────────────────────────────────────────────────────────────────────

update public.products
set options = coalesce((
  select jsonb_agg(
    jsonb_build_object(
      'name', opt->>'name',
      'values', coalesce((
        select jsonb_agg(
          case
            when jsonb_typeof(v) = 'object' and v ? 'label' then v
            else jsonb_build_object('label', v #>> '{}', 'price_modifier', 0)
          end
        )
        from jsonb_array_elements(opt->'values') v
      ), '[]'::jsonb)
    )
  )
  from jsonb_array_elements(options) opt
), '[]'::jsonb)
where jsonb_typeof(options) = 'array';
