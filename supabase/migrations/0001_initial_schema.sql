-- ────────────────────────────────────────────────────────────────────
-- gpt-mall 초기 스키마 (2026-05-14)
--
-- 적용 방법:
--   1) Supabase Dashboard > SQL Editor 에 전체 붙여넣기 후 Run
--   2) 또는 Management API:
--        curl -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
--          -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
--          -H "Content-Type: application/json" \
--          -d @<(jq -Rs '{query: .}' < 0001_initial_schema.sql)
--   3) 또는 supabase CLI: npx supabase db push (link 후)
-- ────────────────────────────────────────────────────────────────────

-- gen_random_uuid() 보장 (Postgres 13+에서 기본이지만 명시).
create extension if not exists pgcrypto;

-- ──────────────────────────────────────────────
-- 공통 헬퍼: updated_at 자동 갱신
-- ──────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ──────────────────────────────────────────────
-- profiles (auth.users 확장)
-- ──────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  display_name text,
  phone       text,
  created_at  timestamptz not null default now()
);

-- 신규 회원가입 시 profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer  -- profiles 테이블 RLS 우회 위해
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;  -- 중복 대비 idempotent
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ──────────────────────────────────────────────
-- 권한 헬퍼: 현재 사용자가 admin 인가?
-- security definer 로 profiles RLS 우회. policies 내부에서 사용.
-- ──────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- profiles 의 role 컬럼은 본인이 직접 못 바꾸도록 트리거로 보호
create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql
as $$
begin
  if (old.role is distinct from new.role)
     and not coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
  then
    raise exception 'profiles.role 을 변경할 권한이 없습니다';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_self_change on public.profiles;
create trigger profiles_prevent_role_self_change
  before update on public.profiles
  for each row execute function public.prevent_role_self_change();

-- ──────────────────────────────────────────────
-- products
-- ──────────────────────────────────────────────
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text unique not null,
  category          text not null check (category in (
                       'ai_assistant','ai_image','ai_coding','ai_video','ai_voice','productivity'
                    )),
  price             integer not null check (price >= 0),
  original_price    integer check (original_price is null or original_price >= price),
  image_url         text,
  description       text,
  short_description text,
  stock             integer not null default 0 check (stock >= 0),
  options           jsonb not null default '[]'::jsonb,
  badge             text check (badge is null or badge in ('BEST','NEW','HOT')),
  is_active         boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- 인덱스
create index if not exists idx_products_slug          on public.products(slug);
create index if not exists idx_products_category_sort on public.products(category, sort_order);
create index if not exists idx_products_is_active     on public.products(is_active) where is_active = true;

-- ──────────────────────────────────────────────
-- orders
-- ──────────────────────────────────────────────
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete set null,
  order_number     text unique not null,
  total            integer not null check (total >= 0),
  status           text not null default 'pending' check (status in (
                      'pending','paid','delivered','cancelled','refunded'
                   )),
  payment_method   text check (payment_method is null or payment_method in (
                      'kakaopay','naverpay','card'
                   )),
  recipient_name   text not null,
  recipient_email  text not null,
  recipient_phone  text not null,
  memo             text,
  paid_at          timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_orders_user_created on public.orders(user_id, created_at desc);
create index if not exists idx_orders_number       on public.orders(order_number);
create index if not exists idx_orders_status       on public.orders(status);

-- ──────────────────────────────────────────────
-- order_items
-- ──────────────────────────────────────────────
create table if not exists public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders(id) on delete cascade,
  product_id        uuid not null references public.products(id) on delete restrict,
  product_name      text not null,
  product_image     text,
  price             integer not null check (price >= 0),
  qty               integer not null default 1 check (qty > 0),
  selected_options  jsonb not null default '{}'::jsonb
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- ────────────────────────────────────────────────────────────────────
-- RLS — 모든 테이블 활성화 후 정책 정의
-- ────────────────────────────────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- ── profiles ────────────────────────────────────────────────────────
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- INSERT는 트리거(handle_new_user)에서만 발생 — 직접 INSERT 정책 없음
-- (security definer 함수가 RLS 우회)

-- ── products ────────────────────────────────────────────────────────
drop policy if exists products_select_public on public.products;
create policy products_select_public on public.products
  for select using (is_active = true);

drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ── orders ──────────────────────────────────────────────────────────
drop policy if exists orders_select_own_or_admin on public.orders;
create policy orders_select_own_or_admin on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

-- 누구나 주문 생성 가능 (비회원 결제 대비). 단, user_id 위조 방지:
-- 로그인 상태면 본인 id 강제, 비로그인이면 null 강제.
drop policy if exists orders_insert_anyone on public.orders;
create policy orders_insert_anyone on public.orders
  for insert with check (
    (auth.uid() is null and user_id is null) or
    (auth.uid() is not null and user_id = auth.uid())
  );

drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- ── order_items ─────────────────────────────────────────────────────
drop policy if exists order_items_select_own on public.order_items;
create policy order_items_select_own on public.order_items
  for select using (
    public.is_admin() or
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or (auth.uid() is null and o.user_id is null))
    )
  );

drop policy if exists order_items_insert_anyone on public.order_items;
create policy order_items_insert_anyone on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (
          (auth.uid() is null and o.user_id is null) or
          (auth.uid() is not null and o.user_id = auth.uid())
        )
    )
  );

-- ────────────────────────────────────────────────────────────────────
-- 끝.
-- admin 승격: UPDATE public.profiles SET role='admin' WHERE id='<auth.users.id>';
-- ────────────────────────────────────────────────────────────────────
