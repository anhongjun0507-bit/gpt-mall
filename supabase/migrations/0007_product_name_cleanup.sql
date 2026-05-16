-- ────────────────────────────────────────────────────────────────────
-- 상품명 정리 + 기간 옵션 보강
--
-- 배경: 모든 상품명에 "1개월"이 박혀 있고(예: "Claude Pro 1개월"), 일부는
-- 기간 옵션(1/3/6개월)도 함께 갖고 있어 이름과 옵션이 모순.
--   사용자가 "기간 3개월"을 골라도 이름은 여전히 "Claude Pro 1개월"로 표시.
--
-- 정리:
--   1) 모든 상품 이름의 trailing " N개월" 제거 ("Claude Pro 1개월" → "Claude Pro")
--   2) 기간 옵션이 없는 상품(Midjourney/Cursor)에 기간 옵션 스켈레톤 추가
--      values: 1/3/6개월, price_modifier 는 모두 0 (운영자가 추후 채울 것)
--   3) ChatGPT Plus 에는 6개월 항목 누락 — 함께 추가 (price_modifier=0, 추후 채움)
--
-- 안전:
--   - WHERE 절로 이름 패턴 매칭만 (다른 상품 영향 X)
--   - 옵션 추가는 "기간" 옵션이 없는 경우에만, 또는 6개월 항목이 없을 때만
--   - price 컬럼은 건드리지 않음
-- ────────────────────────────────────────────────────────────────────

-- 1) 이름 정리: "... N개월" 형태 trailing 제거
update public.products
set name = regexp_replace(name, '\s*\d+\s*개월\s*$', '')
where name ~ '\s+\d+\s*개월\s*$';

-- 2) 기간 옵션이 아예 없는 상품에 스켈레톤 추가
--    (현재 옵션 배열이 비어있고 이름이 정리된 상품 대상)
update public.products
set options = jsonb_build_array(
  jsonb_build_object(
    'name', '기간',
    'values', jsonb_build_array(
      jsonb_build_object('label', '1개월', 'price_modifier', 0),
      jsonb_build_object('label', '3개월', 'price_modifier', 0),
      jsonb_build_object('label', '6개월', 'price_modifier', 0)
    )
  )
)
where jsonb_typeof(options) = 'array'
  and jsonb_array_length(options) = 0;

-- 3) 기간 옵션은 있지만 6개월이 없는 상품에 6개월 추가
--    (현재 ChatGPT Plus 가 1/3 만 있음)
update public.products
set options = (
  select jsonb_agg(
    case
      when opt->>'name' = '기간'
       and not exists (
            select 1 from jsonb_array_elements(opt->'values') v
            where v->>'label' = '6개월'
          )
      then jsonb_set(
        opt,
        '{values}',
        (opt->'values') || jsonb_build_array(
          jsonb_build_object('label', '6개월', 'price_modifier', 0)
        )
      )
      else opt
    end
  )
  from jsonb_array_elements(options) opt
)
where jsonb_typeof(options) = 'array'
  and exists (
    select 1 from jsonb_array_elements(options) o
    where o->>'name' = '기간'
      and not exists (
        select 1 from jsonb_array_elements(o->'values') v
        where v->>'label' = '6개월'
      )
  );
