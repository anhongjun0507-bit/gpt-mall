import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Zap,
  ShieldCheck,
  Headphones,
  Sparkles,
  Palette,
  Code2,
  Video,
  Mic,
  Rocket,
  MessageCircle,
} from "lucide-react";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/server";
import { getCategoryShortLabel } from "@/lib/product-categories";
import type { Product } from "@/types/database";

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

const WHY_REASONS = [
  {
    Icon: Zap,
    title: "즉시 발급",
    desc: "결제 완료 후 1분 이내 자동으로 라이센스가 발급됩니다. 기다림 없이 바로 사용 가능.",
  },
  {
    Icon: ShieldCheck,
    title: "100% 정품 보장",
    desc: "모든 라이센스는 공식 채널을 통해 정품으로만 취급합니다. 안심하고 구매하세요.",
  },
  {
    Icon: Headphones,
    title: "24/7 고객 지원",
    desc: "문제가 생기면 언제든 카카오톡으로 문의하세요. 평균 5분 이내 응답.",
  },
] as const;

// 홈 카테고리 — label 은 사용자에게 보이는 한글, slug 는 백엔드 enum 과 일치.
// 일치 대상: ProductCategory in src/types/database.ts + ProductFilters.tsx.
const CATEGORIES = [
  { Icon: Sparkles, label: "AI 어시스턴트", slug: "ai_assistant" },
  { Icon: Palette, label: "디자인", slug: "ai_image" },
  { Icon: Code2, label: "코딩", slug: "ai_coding" },
  { Icon: Video, label: "영상", slug: "ai_video" },
  { Icon: Mic, label: "음성", slug: "ai_voice" },
  { Icon: Rocket, label: "생산성", slug: "productivity" },
] as const;

// 작은 inline component — 라벨 좌측 골드 가로 라인.
function GoldLineLabel({
  children,
  align = "start",
}: {
  children: React.ReactNode;
  align?: "start" | "center";
}) {
  if (align === "center") {
    return (
      <div className="inline-flex items-center gap-3">
        <span aria-hidden className="w-8 h-px bg-accent-gold" />
        <span className="text-xs tracking-[0.3em] uppercase text-accent-gold font-semibold">
          {children}
        </span>
        <span aria-hidden className="w-8 h-px bg-accent-gold" />
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-3">
      <span aria-hidden className="w-8 h-px bg-accent-gold" />
      <span className="text-xs tracking-[0.3em] uppercase text-accent-gold font-semibold">
        {children}
      </span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default async function HomePage() {
  const featured = await fetchFeaturedProducts();
  return (
    <>
      {/* ═══ Section 1: Hero ════════════════════════════════ */}
      <section className="relative overflow-hidden h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] min-h-[640px] bg-gradient-to-b from-background via-background to-secondary/30">
        {/* 우상단 골드 글로우 — blur로 부드럽게 */}
        <div
          aria-hidden
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-accent-gold/30 rounded-full blur-3xl"
        />
        {/* 좌하단 골드 글로우 (더 옅게) */}
        <div
          aria-hidden
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent-gold/20 rounded-full blur-3xl"
        />

        <Container className="relative h-full flex items-center">
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <GoldLineLabel>PREMIUM AI LICENSES</GoldLineLabel>

            <Heading variant="display" as="h1" className="mt-6 text-foreground">
              당신의 작업을{" "}
              {/* 모바일에서는 줄바꿈 — 데스크탑에서는 한 줄로 자연스럽게 흐름 */}
              <br className="md:hidden" />
              <span className="bg-gradient-to-r from-accent-gold via-accent-gold-hover to-accent-gold bg-clip-text text-transparent">
                10배 빠르게
              </span>
              <span className="text-foreground">.</span>
            </Heading>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              공식 라이센스, 즉시 발급, 합리적인 가격. AI 시대의 모든 도구를 한
              곳에서.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="h-14 px-8 text-base group">
                <Link href="/products">
                  지금 시작하기
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base">
                <Link href="/products">상품 둘러보기</Link>
              </Button>
            </div>

            {/* 신뢰 지표 */}
            <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className="text-accent-gold">✓</span> 즉시 발급
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-accent-gold">✓</span> 100% 정품
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-accent-gold">✓</span> 24/7 지원
              </li>
            </ul>
          </div>
        </Container>

        {/* 스크롤 인디케이터 */}
        <div
          aria-hidden
          className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-60 animate-bounce"
        >
          <ChevronDown className="h-6 w-6 text-foreground" />
        </div>
      </section>

      {/* ═══ Section 2: Featured Products ════════════════════ */}
      <Section>
        <Container>
          <div className="flex items-end justify-between mb-12">
            <div>
              <GoldLineLabel>BEST SELLERS</GoldLineLabel>
              <Heading variant="h2" className="mt-3">
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* ═══ Section 3: Why Us ══════════════════════════════ */}
      <Section className="bg-secondary/30">
        <Container>
          <div className="text-center mb-16">
            <GoldLineLabel align="center">WHY US</GoldLineLabel>
            <Heading variant="h2" className="mt-3">
              왜 디지털스토어인가
            </Heading>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              수많은 라이센스 판매처 중에서 왜 우리를 선택해야 하는지.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY_REASONS.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl bg-card border border-border/50 p-8 transition-all duration-300 hover:border-accent-gold/40 hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent-gold/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-accent-gold" />
                </div>
                <h3 className="mt-6 font-bold text-xl">{title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ═══ Section 4: Categories ══════════════════════════ */}
      <Section>
        <Container>
          <div className="mb-12">
            <GoldLineLabel>CATEGORIES</GoldLineLabel>
            <Heading variant="h2" className="mt-3">
              카테고리별로 둘러보기
            </Heading>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ Icon, label, slug }) => (
              <Link
                key={slug}
                href={`/products?category=${slug}`}
                className="group relative aspect-square rounded-2xl bg-card border border-border hover:border-accent-gold hover:bg-accent-gold/5 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-6"
              >
                <Icon className="w-8 h-8 text-muted-foreground group-hover:text-accent-gold transition-gold" />
                <span className="text-sm font-medium text-center">{label}</span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* ═══ Section 5: Final CTA ═══════════════════════════
         모드 독립 다크 톤 (Footer와 동일 토큰 재사용) — 라이트/다크 모두 항상 어둡게 */}
      <section className="relative overflow-hidden bg-footer-bg text-footer-foreground py-24 md:py-32">
        {/* 중앙 거대 골드 라디얼 그라데이션 */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent-gold-faint),_transparent_70%)]"
        />

        <Container className="relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2">
              <p className="text-xs tracking-[0.3em] uppercase text-accent-gold font-semibold">
                READY?
              </p>
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full bg-accent-gold"
              />
            </div>
            <Heading
              variant="h2"
              className="mt-5 !text-4xl md:!text-5xl lg:!text-6xl !text-footer-foreground tracking-tight"
            >
              지금 바로 시작하세요
            </Heading>
            <p className="mt-6 text-lg text-footer-foreground/70 leading-relaxed max-w-2xl mx-auto">
              공식 라이센스, 즉시 발급. 안전하고 빠른 디지털 상품 구매.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 bg-accent-gold hover:bg-accent-gold-hover text-footer-bg group"
              >
                <Link href="/products">
                  상품 보기
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 border-footer-foreground/30 bg-transparent text-footer-foreground hover:bg-footer-foreground/10 hover:text-footer-foreground"
              >
                <a
                  href="https://pf.kakao.com/_xhHWgn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  카카오톡 문의
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
