import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

// 인덱싱 대상 정적 경로 — canonical 을 부여한 페이지와 일치시킨다.
// 값은 각 페이지의 실제 최종 변경 시각(커밋 시각). 빌드 시각을 쓰면
// 배포마다 전 경로가 갱신돼 lastmod 신호가 무의미해지므로 수동 상수로 둔다.
const STATIC_LAST_MODIFIED: Record<string, string> = {
  "/": "2026-08-18T08:22:55Z",
  "/products": "2026-08-18T08:22:55Z",
  "/faq": "2026-08-24T02:32:15Z",
  "/terms": "2026-08-18T08:22:55Z",
  "/privacy": "2026-08-24T08:48:48Z",
  "/business-info": "2026-08-18T08:22:55Z",
};

const STATIC_PATHS = Object.keys(STATIC_LAST_MODIFIED);

// 활성 상품 slug 를 동적으로 편입. 조회 실패 시 정적 경로만 반환(사이트맵 자체는 항상 유효).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(STATIC_LAST_MODIFIED[path]),
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
