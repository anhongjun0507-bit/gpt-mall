import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/server";
import { getCategoryShortLabel } from "@/lib/product-categories";
import type { Product } from "@/types/database";

// title·description 은 루트 default 를 그대로 쓴다 (홈 = 사이트 대표 메타).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// 홈 인기 상품 — DB 실시간 조회 (sort_order 우선, 활성 상품만, 최대 4건).
// 관리자에서 상품 수정/이미지 교체 시 즉시 반영되도록 dynamic.
async function fetchFeaturedProducts(): Promise<ProductCardData[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, name, category, price, original_price, image_url, badge"
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(4);
    if (error) throw error;
    const rows = (data ?? []) as Pick<
      Product,
      | "id"
      | "slug"
      | "name"
      | "category"
      | "price"
      | "original_price"
      | "image_url"
      | "badge"
    >[];
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: getCategoryShortLabel(p.category),
      price: p.price,
      originalPrice: p.original_price ?? undefined,
      image: p.image_url ?? "",
      badge: p.badge ?? undefined,
    }));
  } catch (e) {
    console.error("[home/featured] 인기 상품 조회 실패", e);
    return [];
  }
}

// ─── Page ────────────────────────────────────────────────────
// 홈의 목적은 "첫 화면에서 상품이 보이는 것" 하나다.
// 풀스크린 히어로·소개 섹션·카테고리·CTA 섹션을 모두 걷어내고
// [얇은 배너 → 인기 상품 → 푸터] 만 남겨 데스크탑 1화면에 들어오게 한다.
export default async function HomePage() {
  const featured = await fetchFeaturedProducts();
  return (
    <>
      {/* ═══ 얇은 상단 배너 ═════════════════════════════════
         배너 아트워크가 다크 배경 전제로 제작돼 라이트 모드에선 경계가 드러난다.
         Footer 와 동일한 모드 독립 다크 토큰을 써서 이미지를 녹인다. */}
      <section className="relative overflow-hidden bg-footer-bg text-footer-foreground">
        <div aria-hidden className="absolute inset-y-0 right-0 w-full md:w-1/2">
          <Image
            src="/hero-banner.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center"
          />
          {/* 좌→우 스크림: 텍스트가 얹히는 좌측을 다크 배경색으로 덮어 가독성 확보 */}
          <div className="absolute inset-0 bg-gradient-to-r from-footer-bg via-footer-bg/70 to-transparent" />
          {/* 모바일은 이미지가 화면을 꽉 채워 텍스트와 겹치므로 한 겹 더 눌러준다 */}
          <div className="absolute inset-0 bg-footer-bg/60 md:hidden" />
        </div>

        <Container className="relative">
          <div className="flex h-16 md:h-20 items-center justify-between gap-4">
            <div className="min-w-0">
              {/* 라벨은 데스크탑에서만 — 모바일에선 줄바꿈되며 배너가 두꺼워진다 */}
              <div className="hidden md:inline-flex items-center gap-2">
                <span aria-hidden className="w-6 h-px bg-accent-gold" />
                <span className="text-xs tracking-[0.25em] uppercase text-accent-gold font-semibold">
                  SUBSCRIPTION SHARING
                </span>
              </div>
              <p className="md:mt-1 text-base md:text-2xl font-extrabold tracking-tight">
                당신의 작업을{" "}
                <span className="text-accent-gold">10배 빠르게</span>.
              </p>
            </div>

            <Button
              asChild
              className="shrink-0 h-9 md:h-10 px-4 md:px-5 text-sm bg-accent-gold hover:bg-accent-gold-hover text-footer-bg group"
            >
              <Link href="/products">
                전체 상품
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* ═══ 인기 상품 ══════════════════════════════════════ */}
      <section className="py-6 md:py-8">
        <Container>
          <div className="flex items-end justify-between mb-4 md:mb-5">
            <div>
              <div className="inline-flex items-center gap-3">
                <span aria-hidden className="w-8 h-px bg-accent-gold" />
                <span className="text-xs tracking-[0.3em] uppercase text-accent-gold font-semibold">
                  BEST SELLERS
                </span>
              </div>
              <Heading variant="h2" as="h1" className="mt-2">
                지금 가장 인기있는
              </Heading>
            </div>
            <Link
              href="/products"
              className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-accent-gold transition-gold group"
            >
              전체 보기
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              등록된 상품이 아직 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          )}

          {/* 모바일 — 헤더 우측 링크가 숨겨지므로 하단에 전체 보기 제공 */}
          <div className="mt-6 md:hidden">
            <Button asChild variant="outline" className="w-full">
              <Link href="/products">전체 상품 보기</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
