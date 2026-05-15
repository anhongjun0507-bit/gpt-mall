-- ────────────────────────────────────────────────────────────────────
-- password_attempts — 비밀번호 변경 폼의 현재 비밀번호 검증 실패 기록.
--
-- 사용 흐름 (src/app/(shop)/account/password/actions.ts):
--   1) 호출 시점에 user_id 기준 최근 5분 내 행 count ≥ 5 면 차단.
--   2) signInWithPassword 검증 실패 → 행 1건 insert.
--   3) 성공 → user_id 의 모든 행 delete (누적 시도 초기화).
--
-- 한계: Vercel serverless 라 같은 user 라도 다른 인스턴스에서 같은 시점에
--   접근 시 race 발생 가능. best-effort 수준. 더 강력한 보호가 필요하면
--   Upstash Redis 또는 Supabase Auth Hook(hook_password_verification_attempt)
--   으로 전환.
-- ────────────────────────────────────────────────────────────────────

create table if not exists public.password_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists idx_password_attempts_user_time
  on public.password_attempts(user_id, created_at desc);

-- RLS — 사용자에게는 절대 노출 X. 정책 없음 = default deny.
-- service_role 만 RLS 우회로 접근 가능 (서버 액션에서만 사용).
alter table public.password_attempts enable row level security;
