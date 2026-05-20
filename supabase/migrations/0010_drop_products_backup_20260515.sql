-- ────────────────────────────────────────────────────────────────────
-- Cleanup: 마이그레이션 0006(option_price_modifier) 시 안전 장치로 만든 백업 테이블
-- Supabase RLS 보안 경고(rls_disabled_in_public) 해소를 위해 제거
--
-- 향후 마이그레이션에서 임시 테이블 만들 때 RLS 명시적 활성화 필수:
--   CREATE TABLE temp_table AS SELECT ...;
--   ALTER TABLE temp_table ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY temp_admin_only ON temp_table ...;
-- ────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS public.products_backup_20260515;
