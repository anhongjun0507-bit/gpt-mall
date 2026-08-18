import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

// 인덱싱 대상 정적 경로 — canonical 을 부여한 페이지와 일치시킨다.
const STATIC_PATHS = [
  "/",
  "/products",
  "/terms",
  "/privacy",
  "/business-info",
] as const;

// 활성 상품 slug 를 동적으로 편입. 조회 실패 시 정적 경로만 반환(사이트맵 자체는 항상 유효).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true);
    if (error) throw error;
    productEntries = (data ?? []).map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    }));
  } catch (e) {
    console.error("[sitemap] 활성 상품 조회 실패", e);
  }

  return [...staticEntries, ...productEntries];
}
