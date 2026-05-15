import Link from "next/link";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSort, SORT_OPTIONS, type SortKey } from "@/components/product/ProductSort";
import { getCategoryShortLabel, isValidCategory } from "@/lib/product-categories";
import type { Product, ProductCategory } from "@/types/database";

export const metadata: Metadata = {
  title: "전체 상품",
};

// 정렬 키 → Postgres 컬럼 매핑
const SORT_QUERY: Record<SortKey, { column: string; ascending: boolean }> = {
  latest: { column: "created_at", ascending: false },
  price_asc: { column: "price", ascending: true },
  price_desc: { column: "price", ascending: false },
};

// Server Component — RLS가 is_active=true 만 노출하므로 추가 필터 불필요.
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string };
}) {
  // 입력 검증 — 유효하지 않은 값은 무시 (URL 조작 방어)
  const category: ProductCategory | "" =
    searchParams.category && isValidCategory(searchParams.category)
      ? searchParams.category
      : "";
  const sortKey: SortKey =
    searchParams.sort && searchParams.sort in SORT_OPTIONS
      ? (searchParams.sort as SortKey)
      : "latest";

  let products: Product[] = [];
  let count = 0;
  try {
    const supabase = createClient();
    let query = supabase
      .from("products")
      .select("*", { count: "exact" });
    if (category) query = query.eq("category", category);
    const { column, ascending } = SORT_QUERY[sortKey];
    query = query
      .order(column, { ascending })
      .order("sort_order", { ascending: false });

    const { data, count: c, error } = await query;
    if (error) throw error;
    products = (data ?? []) as Product[];
    count = c ?? 0;
  } catch (e) {
    console.error("[/products] 상품 조회 실패", e);
  }

  return (
    <Container className="py-12 md:py-16">
      {/* 페이지 헤더 */}
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-accent-gold font-semibold">
          ALL PRODUCTS
        </p>
        <Heading variant="h2" className="mt-3">
          전체 상품
        </Heading>
        <p className="mt-2 text-muted-foreground">총 {count}개</p>
      </div>

      {/* 필터 + 정렬 */}
      <div className="mt-8 flex flex-wrap gap-3 items-center justify-between">
        <ProductFilters
          active={category}
          sort={sortKey === "latest" ? "" : sortKey}
        />
        <ProductSort value={sortKey} />
      </div>

      {/* 그리드 또는 빈 상태 */}
      {products.length === 0 ? (
        <EmptyState hasFilter={Boolean(category)} />
      ) : (
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              name={p.name}
              category={getCategoryShortLabel(p.category)}
              price={p.price}
              originalPrice={p.original_price ?? undefined}
              image={p.image_url ?? "https://picsum.photos/600/600?random=" + p.slug}
              badge={p.badge ?? undefined}
            />
          ))}
        </div>
      )}
    </Container>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="mt-20 mx-auto max-w-md text-center">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
        <span className="text-3xl" aria-hidden>
          ✦
        </span>
      </div>
      <Heading variant="h3" as="p" className="mt-6">
        {hasFilter ? "조건에 맞는 상품이 없습니다" : "아직 등록된 상품이 없습니다"}
      </Heading>
      <p className="mt-3 text-muted-foreground">
        {hasFilter
          ? "다른 카테고리를 둘러보시거나 전체 상품을 확인해주세요."
          : "관리자가 상품을 등록하면 여기에 표시됩니다."}
      </p>
      {hasFilter && (
        <Button asChild variant="outline" className="mt-6">
          <Link href="/products">전체 상품 보기</Link>
        </Button>
      )}
    </div>
  );
}
