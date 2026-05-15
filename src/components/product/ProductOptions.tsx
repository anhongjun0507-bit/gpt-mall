"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart";
import type { Product, ProductOption } from "@/types/database";

interface Props {
  product: Pick<
    Product,
    "id" | "slug" | "name" | "price" | "image_url" | "options" | "stock"
  >;
}

// 옵션 선택 + 수량 조절 + 장바구니/바로구매 — 상품 상세 우측 인터랙션 영역.
export function ProductOptions({ product }: Props) {
  const router = useRouter();
  const options = (product.options ?? []) as ProductOption[];

  // 옵션마다 첫 값을 기본 선택. 옵션 없으면 빈 객체.
  const [selected, setSelected] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(
      options.map((o) => [o.name, o.values[0] ?? ""]).filter(([, v]) => v !== "")
    )
  );
  const [qty, setQty] = React.useState(1);
  const [adding, setAdding] = React.useState(false);

  const outOfStock = product.stock <= 0;
  const allOptionsChosen = options.every((o) => selected[o.name]);

  function doAdd(): boolean {
    if (!allOptionsChosen) {
      toast({
        title: "옵션을 선택해주세요",
        description: "모든 옵션을 선택해야 장바구니에 담을 수 있습니다.",
        variant: "destructive",
      });
      return false;
    }
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image_url,
      price: product.price,
      qty,
      selectedOptions: selected,
    });
    return true;
  }

  async function handleAddToCart() {
    setAdding(true);
    const ok = doAdd();
    setAdding(false);
    if (ok) {
      toast({
        title: "장바구니에 담았어요",
        description: `${product.name} ${qty}개`,
      });
    }
  }

  function handleBuyNow() {
    if (doAdd()) {
      router.push("/cart");
    }
  }

  return (
    <div>
      {/* ─── 옵션 선택 ─── */}
      {options.length > 0 && (
        <div className="mt-6 space-y-5">
          {options.map((opt) => (
            <div key={opt.name}>
              <p className="text-sm font-semibold mb-2">{opt.name}</p>
              <div className="flex flex-wrap gap-2">
                {opt.values.map((v) => {
                  const isActive = selected[opt.name] === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        setSelected((s) => ({ ...s, [opt.name]: v }))
                      }
                      className={cn(
                        "inline-flex h-10 items-center gap-1.5 px-4 rounded-md border text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-accent-gold/10 border-accent-gold text-accent-gold"
                          : "bg-background border-border text-foreground hover:border-foreground/40"
                      )}
                    >
                      {isActive && <Check className="h-3.5 w-3.5" />}
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── 수량 조절 ─── */}
      <div className="mt-6">
        <p className="text-sm font-semibold mb-2">수량</p>
        <div className="inline-flex h-11 items-center rounded-md border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="수량 감소"
            className="w-11 h-full flex items-center justify-center hover:bg-secondary transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-semibold tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            aria-label="수량 증가"
            className="w-11 h-full flex items-center justify-center hover:bg-secondary transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ─── 액션 버튼 ─── */}
      <div className="mt-8 flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 h-14 text-base"
          onClick={handleAddToCart}
          disabled={outOfStock || adding}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {outOfStock ? "품절" : "장바구니"}
        </Button>
        <Button
          size="lg"
          className="flex-1 h-14 text-base"
          onClick={handleBuyNow}
          disabled={outOfStock}
        >
          바로 구매
        </Button>
      </div>
    </div>
  );
}
