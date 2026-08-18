-- ────────────────────────────────────────────────────────────────────
-- 회원 탈퇴 시 주문 보존 (2026-08-18)
--
-- 조사 결과 orders.user_id 는 이미 nullable + `on delete set null` 이라
-- auth.users 를 지워도 orders/order_items 행은 그대로 남는다 (전자상거래법
-- 거래기록 5년 보존). FK 자체는 손댈 것이 없다.
--
-- 다만 user_id 가 NULL 인 주문에는 두 종류가 섞인다.
--   (1) 비회원 주문 — 처음부터 로그인 없이 접수 (/checkout 은 비회원 허용)
--   (2) 탈퇴 회원 주문 — 회원이 낸 주문인데 계정 삭제로 링크가 끊긴 것
-- 관리자 화면에서 이 둘을 구분하려면 표시가 필요하므로 컬럼 하나를 둔다.
-- 개인정보는 담지 않고 '탈퇴 시각'만 기록한다.
--
-- 신규 테이블 없음 → 기존 orders RLS 정책이 새 컬럼에도 그대로 적용된다.
-- (select: 본인 or admin / update: admin. 탈퇴 스탬프는 service_role 이 기록)
-- ────────────────────────────────────────────────────────────────────

alter table public.orders
  add column if not exists user_withdrawn_at timestamptz;

comment on column public.orders.user_withdrawn_at is
  '주문자가 회원 탈퇴한 시각. NULL + user_id NULL 이면 비회원 주문, '
  '값이 있으면 탈퇴한 회원의 주문 (거래기록은 법령에 따라 보존)';
