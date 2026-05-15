-- ────────────────────────────────────────────────────────────────────
-- 트리거 수정: prevent_role_self_change 가 service-level 연결도 차단하던 버그.
--
-- 0001 에선 트리거가 auth.uid() 가 null 이면 (즉 service-role 또는 Management API
-- 같이 사용자 세션이 없는 연결) 무조건 차단했음. 그러면 admin 승격 같은 운영
-- 작업이 불가능. 이 버전은 auth.uid() 가 null 이면 통과시킴.
--
-- 보안 영향:
--   - RLS UPDATE policy 가 'id = auth.uid()' 라 미인증 REST 호출은 어차피 차단됨.
--   - service_role 키로 직접 호출하는 곳은 신뢰할 수 있는 운영 영역.
-- ────────────────────────────────────────────────────────────────────

create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql
as $$
begin
  if (old.role is distinct from new.role)
     and auth.uid() is not null  -- service-level 연결(auth.uid()=null)은 통과
     and not coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
  then
    raise exception 'profiles.role 을 변경할 권한이 없습니다';
  end if;
  return new;
end;
$$;
