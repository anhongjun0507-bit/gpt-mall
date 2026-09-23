import Link from "next/link";

import { cn } from "@/lib/utils";
import { formatMonthlyPrice } from "@/lib/format";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: "BEST" | "NEW" | "HOT" | string;
}

// 한국 원 통화 포맷 — 1000원 단위 콤마.
const formatKRW = (v: number) => `₩${v.toLocaleString("ko-KR")}`;

// 배지 톤 — BEST는 골드, NEW는 다크 (대비 강한 두 가지로 위계 분리).
function badgeClass(label: string) {
  switch (label) {
    case "BEST":
      return "bg-accent-gold text-foreground";
    case "NEW":
      return "bg-foreground text-background";
    default:
      return "bg-card text-foreground border border-border";
  }
}

export function ProductCard({
  slug,
  name,
  category,
  price,
  originalPrice,
  image,
  badge,
}: ProductCardData) {
  const hasDiscount = typeof originalPrice === "number" && originalPrice > price;
  // 기간제 상품만 월 환산가 표시. 아니면 null → 렌더 안 함.
  const monthlyPrice = formatMonthlyPrice(name, price);

  return (
    <Link
      href={`/products/${slug}`}
      className="group block rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-accent-gold/40 hover:shadow-xl transition-all duration-300"
    >
      {/* 이미지 영역 — square aspect로 그리드 정렬 균일하게 */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {/* 외부 도메인 더미 이미지라 next/image 미사용 — alt만 정확히 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {badge && (
          <span
            className={cn(
              "absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider",
              badgeClass(badge)
            )}
          >
            {badge}
          </span>
        )}
      </div>

      {/* 본문 영역 */}
      <div className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {category}
        </p>
        <h3 className="mt-1.5 font-semibold text-base line-clamp-2 leading-snug group-hover:text-accent-gold transition-gold">
          {name}
        </h3>
        {/* 좁은 폭에선 정가가 다음 줄로 내려간다 — 금액은 한 덩어리로 유지(잘림 금지).
            판매가는 칸 폭(cqi)에 맞춰 필요할 때만 줄어든다 (320px 에서 7자리 금액 대응) */}
        <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-2 [container-type:inline-size]">
          <span
            className={cn(
              "whitespace-nowrap text-[length:clamp(1rem,17cqi,1.125rem)] leading-7 font-bold",
              hasDiscount ? "text-accent-gold" : "text-foreground"
            )}
          >
            {formatKRW(price)}
          </span>
          {hasDiscount && (
            <span className="whitespace-nowrap text-sm text-muted-foreground line-through">
              {formatKRW(originalPrice!)}
            </span>
          )}
        </div>
        {monthlyPrice && (
          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
            {monthlyPrice}
          </p>
        )}
      </div>
    </Link>
  );
}
