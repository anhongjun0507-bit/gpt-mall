/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // next/image 사용 시 외부 도메인 화이트리스트.
    // picsum.photos: 디자인 단계 더미 이미지 (production 진입 전 실제 상품 이미지 도메인으로 교체).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
    ],
  },
  // 옛 슬러그(-1month 접미사) → 새 슬러그 영구 리다이렉트.
  // 0009 마이그레이션으로 products.slug 가 정규화되어 옛 URL 이 404 되는 것 방지.
  async redirects() {
    return [
      { source: "/products/chatgpt-plus-1month", destination: "/products/chatgpt-plus", permanent: true },
      { source: "/products/claude-pro-1month",   destination: "/products/claude-pro",   permanent: true },
      { source: "/products/cursor-pro-1month",   destination: "/products/cursor-pro",   permanent: true },
    ];
  },
};

export default nextConfig;
