# Supabase 셋업

## 1. 프로젝트

- ref: `rrgsbbwkafvkqwnodmir`
- region: `ap-northeast-2` (Seoul)
- Postgres: 17

## 2. 환경 변수 (`.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://rrgsbbwkafvkqwnodmir.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # 브라우저 노출 OK (RLS로 보호)
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # 서버 코드 전용
SUPABASE_ACCESS_TOKEN=sbp_...            # CLI/Management API용 (선택)
```

## 3. 스키마 마이그레이션 적용

### 옵션 1 — Supabase Dashboard (가장 쉬움)

1. https://supabase.com/dashboard/project/rrgsbbwkafvkqwnodmir/sql/new 접속
2. `supabase/migrations/0001_initial_schema.sql` 전체 복사
3. 붙여넣고 Run

### 옵션 2 — Management API (CI/스크립트)

```bash
set -a && source .env.local && set +a
SQL=$(cat supabase/migrations/0001_initial_schema.sql)
curl -X POST "https://api.supabase.com/v1/projects/rrgsbbwkafvkqwnodmir/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg q "$SQL" '{query: $q}')"
```

### 옵션 3 — supabase CLI

```bash
npx supabase login --token $SUPABASE_ACCESS_TOKEN
npx supabase link --project-ref rrgsbbwkafvkqwnodmir
npx supabase db push
```

## 4. 첫 admin 계정 만들기

1. 일반 회원가입으로 계정 생성 (Auth UI 또는 SQL Editor에서 직접 invite)
2. 해당 user의 id를 Supabase Dashboard > Authentication > Users 에서 복사
3. SQL Editor에서:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<auth.users.id>';
```

또는 이메일로 찾고 한번에:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

## 5. Storage 버킷 (상품 이미지)

1. Dashboard > Storage > Create bucket
2. 이름: `products`, Public bucket **체크**
3. 정책 (자동 생성된 것 위에 추가):

```sql
-- 누구나 읽기
create policy "Public read" on storage.objects
  for select using (bucket_id = 'products');

-- admin 만 업로드/수정/삭제
create policy "Admin write" on storage.objects
  for all
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());
```

## 6. 스키마 변경 워크플로

새 마이그레이션 추가 시:

```
supabase/migrations/
  0001_initial_schema.sql     ← 적용됨
  0002_add_reviews.sql        ← 새 변경
```

- 파일명은 `NNNN_description.sql` 형식 (시퀀스 + 의미 있는 이름)
- 각 파일은 **멱등성** 보장 (`create table if not exists`, `drop policy if exists` 등)
- 적용 후 `src/types/database.ts` 동기화

## 7. 타입 자동 생성 (선택)

```bash
set -a && source .env.local && set +a
npx supabase gen types typescript --project-id rrgsbbwkafvkqwnodmir > src/types/database.ts
```

지금은 수동 작성된 타입을 사용 중. CLI가 안정적이라면 위 명령으로 자동화 가능.

## 8. RLS 정책 요약

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| products | 누구나 (is_active=true) / admin은 전체 | admin | admin | admin |
| orders | 본인 / admin | 누구나 (user_id 위조 방지) | admin | (없음 — 실수 방지) |
| order_items | 자신 order의 것 / admin | order 소유자와 일치 시 | (없음) | (없음, order cascade로 삭제) |
| profiles | 본인 / admin | 트리거(`handle_new_user`)만 | 본인(role 제외) / admin | (없음, auth.users cascade) |

- `is_admin()` 함수가 핵심 권한 헬퍼.
- `role` 컬럼은 트리거 `prevent_role_self_change`로 자기 변경 차단.
