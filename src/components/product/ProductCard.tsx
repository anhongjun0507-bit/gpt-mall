import Link from "next/link";

import { cn } from "@/lib/utils";

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
      <div className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {category}
        </p>
        <h3 className="mt-2 font-semibold text-base line-clamp-2 leading-snug group-hover:text-accent-gold transition-gold">
          {name}
        </h3>
        <div className="mt-3 flex items-baseline gap-2">
          <span
            className={cn(
              "text-lg font-bold",
              hasDiscount ? "text-accent-gold" : "text-foreground"
            )}
          >
            {formatKRW(price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatKRW(originalPrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
