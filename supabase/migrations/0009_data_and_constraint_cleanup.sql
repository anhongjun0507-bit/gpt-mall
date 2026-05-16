-- ────────────────────────────────────────────────────────────────────
-- 데이터·제약 정리 (Claude for Chrome 점검 후속)
--
-- 1) products.description 의 escape 된 "\n" 리터럴을 실제 개행 문자로 치환
--    (Claude Pro / ChatGPT Plus 두 상품에 박혀 있음, whitespace-pre-line 으로 렌더 OK)
-- 2) products.short_description 의 "한 달간 사용하실 수 있습니다" → 기간 무관 카피로 교체
-- 3) products.slug 의 trailing "-1month" 제거 → 옵션과 무관한 정규 슬러그로 통일
-- 4) orders.payment_method CHECK 제약에 'bank_transfer' 추가 (무통장입금 노출 위해)
--    naverpay 는 기존 주문 보존을 위해 enum 에서 제거하지 않고 UI 에서만 안 보이게 처리
-- ────────────────────────────────────────────────────────────────────

-- 1) description \n 정리
update public.products
set description = replace(description, '\n', E'\n')
where description like '%\n%';

-- 2) "한 달간 사용하실 수 있습니다" 카피 교체 (기간 옵션이 담당하므로 옵션 무관 카피)
update public.products
set short_description = regexp_replace(
  short_description,
  '를?\s*한 달간\s*사용하실 수 있습니다\.?',
  ' 공식 라이센스를 즉시 발급해드립니다.'
)
where short_description like '%한 달간%';

-- 3) slug 정규화 — trailing "-1month" 제거
update public.products
set slug = regexp_replace(slug, '-1month$', '')
where slug like '%-1month';

-- 4) payment_method CHECK 제약에 bank_transfer 추가
alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (
    payment_method is null
    or payment_method in ('bank_transfer', 'kakaopay', 'naverpay', 'card')
  );
