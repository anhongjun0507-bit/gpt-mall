import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Zap, ShieldCheck, Headphones } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductOptions } from "@/components/product/ProductOptions";
import { getCategoryLabel, getCategoryShortLabel } from "@/lib/product-categories";
import type { Product } from "@/types/database";

interface PageProps {
  params: { slug: string };
}

// 동일 카테고리 다른 상품 4개 — 페이지 하단 추천.
async function fetchRelated(category: Product["category"], excludeId: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .neq("id", excludeId)
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(4);
    if (error) throw error;
    return (data ?? []) as Product[];
  } catch (e) {
    console.error("[/products/[slug]] 추천 상품 조회 실패", e);
    return [] as Product[];
  }
}

async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as Product) ?? null;
  } catch (e) {
    console.error("[/products/[slug]] 상품 조회 실패", e);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await fetchProduct(params.slug);
  if (!product) return { title: "상품을 찾을 수 없음" };
  return {
    title: product.name,
    description: product.short_description ?? product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.short_description ?? undefined,
      images: product.image_url ? [{ url: product.image_url }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await fetchProduct(params.slug);
  if (!product) notFound();

  const related = await fetchRelated(product.category, product.id);

  const fallbackImage = `https://picsum.photos/800/800?random=${product.slug}`;

  return (
    <Container className="py-12 md:py-16">
      {/* ─── 메인 2단 레이아웃 ─── */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* 좌측: 이미지 */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url ?? fallbackImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 우측: 정보 (sticky) */}
        <div className="lg:sticky lg:top-24 self-start">
          <p className="text-xs uppercase tracking-wider text-accent-gold font-semibold">
            {getCategoryShortLabel(product.category)}
          </p>
          <Heading variant="h2" className="mt-2">
            {product.name}
          </Heading>
          {product.short_description && (
            <p className="mt-4 mb-8 text-muted-foreground leading-relaxed">
              {product.short_description}
            </p>
          )}

          {/* 가격 + 옵션 + 수량 + 액션 — 가격은 옵션/수량 반영되어 실시간 표시 */}
          <ProductOptions
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              original_price: product.original_price,
              image_url: product.image_url,
              options: product.options,
              stock: product.stock,
            }}
          />

          {/* 신뢰 지표 */}
          <div className="mt-8 pt-6 border-t border-border grid grid-cols-3 gap-4">
            {[
              { Icon: Zap, label: "즉시 발급" },
              { Icon: ShieldCheck, label: "정품 보장" },
              { Icon: Headphones, label: "24/7 지원" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <Icon className="h-5 w-5 text-accent-gold" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 상세 설명 탭 ─── */}
      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">상품 설명</TabsTrigger>
            <TabsTrigger value="notice">유의사항</TabsTrigger>
            <TabsTrigger value="refund">환불 정책</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            {product.description ? (
              <div className="prose max-w-none text-foreground whitespace-pre-line leading-relaxed">
                {product.description}
              </div>
            ) : (
              <p className="text-muted-foreground">상세 설명이 등록되지 않았습니다.</p>
            )}
          </TabsContent>
          <TabsContent value="notice" className="mt-6 text-body text-muted-foreground leading-relaxed whitespace-pre-line">
            {`• 본 상품은 공식 라이센스 코드로 발급됩니다.\n• 발급된 코드는 환불 불가합니다 (정책 참조).\n• 라이센스 사용 중 발생한 문제는 카카오톡 상담을 통해 해결해 드립니다.`}
          </TabsContent>
          <TabsContent value="refund" className="mt-6 text-body text-muted-foreground leading-relaxed whitespace-pre-line">
            {`• 라이센스 코드 발급 전 결제 취소 시 100% 환불.\n• 발급 후에는 단순 변심에 의한 환불 불가 (디지털 콘텐츠 특성상).\n• 라이센스 자체에 결함이 있는 경우 무상 교환 또는 환불.\n• 환불 요청은 카카오톡 채널을 통해 7일 이내에 접수.`}
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── 관련 상품 ─── */}
      {related.length > 0 && (
        <section className="mt-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-accent-gold font-semibold">
                RELATED
              </p>
              <Heading variant="h3" className="mt-2">
                같은 카테고리 다른 상품
              </Heading>
            </div>
            <Link
              href={`/products?category=${product.category}`}
              className="hidden md:inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent-gold transition-gold"
            >
              {getCategoryLabel(product.category)} 더 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                category={getCategoryShortLabel(p.category)}
                price={p.price}
                originalPrice={p.original_price ?? undefined}
                image={p.image_url ?? `https://picsum.photos/600/600?random=${p.slug}`}
                badge={p.badge ?? undefined}
              />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
