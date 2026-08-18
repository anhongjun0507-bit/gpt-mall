// 사이트 표준 호스트 단일 소스.
// apex(digitalst.kr) 는 www 로 흡수되므로 canonical·sitemap·OG URL 은 전부 www 기준.
// 하드코딩 금지 — metadataBase / sitemap / robots / 알림 링크 모두 여기서 참조.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.digitalst.kr";
