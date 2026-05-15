-- ────────────────────────────────────────────────────────────────────
-- orders.recipient_email NOT NULL 제약 해제.
--
-- 배경: 클라이언트 정책 변경 — 주문서에서 이메일을 받지 않고 휴대전화
--       번호로만 라이센스를 SMS 발송. 컬럼 자체는 유지 (회원 주문은
--       auth.users.email 로 사후 매핑 가능, 향후 이메일 다시 받을 가능성
--       대비). 단지 NOT NULL 제약만 해제.
-- ────────────────────────────────────────────────────────────────────

alter table public.orders alter column recipient_email drop not null;
