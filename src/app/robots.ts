import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// 크롤러 규칙 — 공개 페이지만 허용, 인증·주문·계정 등 비공개 구간은 차단.
// 전역 noindex(layout metadata)가 걸린 동안에는 인덱싱 자체가 막혀 있으나,
// 정식 오픈 시 noindex 해제 후에도 이 disallow 가 비공개 구간을 지킨다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/cart",
        "/checkout",
        "/order",
        "/auth",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
