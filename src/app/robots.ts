import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// 크롤러 규칙 — 공개 페이지만 허용, 인증·주문·계정 등 비공개 구간은 차단.
// 전역 noindex 는 해제됐으므로 이 disallow 와 각 페이지의 개별 robots 메타가
// 비공개 구간을 지키는 유일한 방어선이다.
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
