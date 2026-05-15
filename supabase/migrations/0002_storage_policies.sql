-- ────────────────────────────────────────────────────────────────────
-- Storage 'products' 버킷 RLS 정책
-- 적용: Management API로 즉시 실행됨. 신규 환경에서 다시 적용 시 멱등.
-- ────────────────────────────────────────────────────────────────────

-- public read — 누구나 상품 이미지 조회
drop policy if exists "products_storage_public_read" on storage.objects;
create policy "products_storage_public_read"
  on storage.objects for select
  using (bucket_id = 'products');

-- admin 만 업로드/수정/삭제 (is_admin() 함수 재사용)
drop policy if exists "products_storage_admin_write" on storage.objects;
create policy "products_storage_admin_write"
  on storage.objects for all
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());
