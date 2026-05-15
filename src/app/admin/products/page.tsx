import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatKRW } from "@/lib/format";
import { getCategoryLabel } from "@/lib/product-categories";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import type { Product } from "@/types/database";

export const metadata = { title: "상품 관리" };

async function fetchProducts(): Promise<Product[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Product[];
  } catch (e) {
    console.error("[admin/products] 조회 실패", e);
    return [];
  }
}

export default async function AdminProductsPage() {
  const products = await fetchProducts();

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <Heading variant="h2" className="!text-2xl">
            상품 관리
          </Heading>
          <p className="mt-2 text-muted-foreground">총 {products.length}개</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-1" />
            신규 등록
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-card border border-border/50 p-12 text-center">
          <p className="text-muted-foreground">아직 등록된 상품이 없습니다.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-1" />첫 상품 등록하기
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-card border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-medium w-16">이미지</th>
                <th className="text-left px-5 py-3 font-medium">상품명</th>
                <th className="text-left px-5 py-3 font-medium">카테고리</th>
                <th className="text-right px-5 py-3 font-medium">가격</th>
                <th className="text-right px-5 py-3 font-medium">재고</th>
                <th className="text-center px-5 py-3 font-medium">활성</th>
                <th className="text-right px-5 py-3 font-medium w-24">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-accent-gold/5 transition-colors duration-200"
                >
                  <td className="px-5 py-3">
                    <div className="w-10 h-10 rounded-md bg-secondary overflow-hidden">
                      {p.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {p.slug}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {getCategoryLabel(p.category)}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">
                    {formatKRW(p.price)}
                  </td>
                  <td
                    className={cn(
                      "px-5 py-3 text-right tabular-nums",
                      p.stock <= 0 && "text-destructive"
                    )}
                  >
                    {p.stock}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold",
                        p.is_active
                          ? "bg-accent-gold/10 text-accent-gold"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {p.is_active ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label={`${p.name} 수정`}
                        className="text-muted-foreground hover:text-accent-gold"
                      >
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteProductButton
                        productId={p.id}
                        productName={p.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
