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
};

export default nextConfig;
