import Link from "next/link";

import { cn } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";
import type { ProductCategory } from "@/types/database";

// 카테고리 필터 칩 — Server Component (Link 기반, 클라이언트 JS 불필요).
// 활성 상태는 searchParams.category 와 일치하는지로 결정.
export function ProductFilters({
  active,
  sort,
}: {
  active: ProductCategory | "";
  sort: string;
}) {
  const sortQs = sort ? `&sort=${sort}` : "";

  // "전체" 옵션은 별도 카드로 구성
  const items: Array<{ key: string; label: string; href: string; isActive: boolean }> = [
    {
      key: "all",
      label: "전체",
      href: sort ? `/products?sort=${sort}` : "/products",
      isActive: active === "",
    },
    ...PRODUCT_CATEGORIES.map((c) => ({
      key: c.key,
      label: c.label,
      href: `/products?category=${c.key}${sortQs}`,
      isActive: active === c.key,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {items.map((it) => (
        <Link
          key={it.key}
          href={it.href}
          className={cn(
            "inline-flex h-9 items-center px-4 rounded-md border text-sm font-medium transition-all duration-200",
            it.isActive
              // active = 인버전 (foreground 채움) — 시각 위계 강함, 대비비 충분
              ? "bg-foreground border-foreground text-background"
              : "bg-background border-border text-foreground hover:border-foreground/40"
          )}
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}
