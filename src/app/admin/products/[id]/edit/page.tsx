import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Heading } from "@/components/ui/heading";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/types/database";
import type { ProductFormValues } from "@/app/admin/products/schema";

interface PageProps {
  params: { id: string };
}

export const metadata = { title: "상품 수정" };

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as Product) ?? null;
  } catch (e) {
    console.error("[admin/products/edit] 조회 실패", e);
    return null;
  }
}

// DB row → 폼 초기값 매핑 (널 처리 통일)
function toFormValues(p: Product): ProductFormValues {
  return {
    name: p.name,
    slug: p.slug,
    category: p.category,
    price: p.price,
    original_price: p.original_price ?? null,
    stock: p.stock,
    short_description: p.short_description ?? null,
    description: p.description ?? null,
    image_url: p.image_url ?? null,
    options: p.options ?? [],
    badge: p.badge ?? null,
    is_active: p.is_active,
    sort_order: p.sort_order,
  };
}

export default async function AdminProductsEditPage({ params }: PageProps) {
  const product = await fetchProduct(params.id);
  if (!product) notFound();

  return (
    <>
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-accent-gold transition-gold"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          상품 목록으로
        </Link>
        <Heading variant="h2" className="!text-2xl mt-3">
          상품 수정
        </Heading>
        <p className="mt-2 text-sm text-muted-foreground font-mono">
          {product.slug}
        </p>
      </div>
      <div className="mt-8">
        <ProductForm
          mode="edit"
          productId={product.id}
          initialValues={toFormValues(product)}
        />
      </div>
    </>
  );
}
