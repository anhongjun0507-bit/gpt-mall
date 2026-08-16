-- ────────────────────────────────────────────────────────────────────
-- 무통장 입금 결제 활성화 (2026-08-16)
--
-- 배경: 카드사 가맹 승인이 1개월 이상 더 걸릴 것으로 예상돼 무통장 입금으로
--       먼저 실판매를 시작한다. 카드·간편결제는 UI 에서 비활성 유지.
--
-- 1) orders.status 에 'awaiting_deposit'(입금 대기) 추가
-- 2) 입금 관련 컬럼 2개 추가
-- 3) 입금대기 주문 조회용 부분 인덱스
-- 4) 데이터 정리 — 무통장 안내 없이 접수돼 미입금으로 남은 기존 주문 취소
--
-- 신규 테이블 없음 → 기존 orders RLS 정책이 새 컬럼에도 그대로 적용된다.
-- (테이블을 새로 만들 때는 반드시 enable row level security + 정책 추가할 것)
-- ────────────────────────────────────────────────────────────────────

-- 1) status CHECK 확장 — 'awaiting_deposit' 은 pending 과 별개.
--    pending: 결제 수단 미확정/PG 결제 대기, awaiting_deposit: 계좌 입금 대기.
alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in (
    'pending','awaiting_deposit','paid','delivered','cancelled','refunded'
  ));

-- 2) 입금 정보 컬럼
alter table public.orders
  add column if not exists depositor_name text,
  add column if not exists deposit_due_at timestamptz;

comment on column public.orders.depositor_name is
  '무통장 입금자명 — 주문자명과 다를 수 있어 별도 보관';
comment on column public.orders.deposit_due_at is
  '입금 기한 (주문 시각 + 24시간). 초과분 자동 취소는 하지 않고 운영자가 판단';

-- 3) 운영자가 입금대기 건만 훑어보는 조회 최적화
create index if not exists idx_orders_deposit_due
  on public.orders(deposit_due_at)
  where status = 'awaiting_deposit';

-- 4) 기존 미입금 무통장 주문 정리 — 이 마이그레이션 이전에 접수된 건은
--    계좌 안내 자체가 없었으므로 입금대기로 살리지 않고 취소 처리한다.
update public.orders
set status = 'cancelled'
where status = 'pending'
  and payment_method = 'bank_transfer'
  and created_at < '2026-08-16T00:00:00+09:00';
