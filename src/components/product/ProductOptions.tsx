"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart";
import { formatOrderItemTitle } from "@/lib/order-display";
import type { Product, ProductOption } from "@/types/database";

interface Props {
  product: Pick<
    Product,
    | "id"
    | "slug"
    | "name"
    | "price"
    | "original_price"
    | "image_url"
    | "options"
    | "stock"
  >;
}

const formatKRW = (v: number) => `₩${v.toLocaleString("ko-KR")}`;
const formatSignedKRW = (v: number) =>
  v >= 0
    ? `+${v.toLocaleString("ko-KR")}원`
    : `${v.toLocaleString("ko-KR")}원`;

// 옵션 선택 + 수량 조절 + 가격 표시 + 장바구니/바로구매 — 상품 상세 우측 인터랙션.
// 가격(정가·할인율·옵션·수량 반영 최종 결제가)도 이 컴포넌트가 단일 책임으로 표시.
export function ProductOptions({ product }: Props) {
  const router = useRouter();
  const options = (product.options ?? []) as ProductOption[];

  // 각 옵션의 첫 값(label) 을 기본 선택.
  const [selected, setSelected] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(
      options
        .map((o) => [o.name, o.values[0]?.label ?? ""])
        .filter(([, v]) => v !== "")
    )
  );
  const [qty, setQty] = React.useState(1);
  const [adding, setAdding] = React.useState(false);

  const outOfStock = product.stock <= 0;
  const allOptionsChosen = options.every((o) => selected[o.name]);

  // 선택된 옵션의 price_modifier 합산
  const optionMod = options.reduce((sum, opt) => {
    const chosen = selected[opt.name];
    const v = opt.values.find((x) => x.label === chosen);
    return sum + (v?.price_modifier ?? 0);
  }, 0);

  const unitPrice = product.price + optionMod;
  const totalPrice = unitPrice * qty;

  const hasDiscount =
    product.original_price !== null &&
    product.original_price !== undefined &&
    product.original_price > product.price;
  const discountPct =
    hasDiscount && product.original_price
      ? Math.round(
          ((product.original_price - product.price) /
            product.original_price) *
            100
        )
      : 0;

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
      price: unitPrice, // 옵션 modifier 반영된 단가 (서버에서 재검증)
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
        // 상품명 + 선택 옵션 + 수량 → "Claude Pro · 기간 3개월 / 2개"
        description: `${formatOrderItemTitle(product.name, selected)} / ${qty}개`,
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
      {/* ─── 가격 영역 ─── */}
      <div className="py-6 border-y border-border">
        {hasDiscount && (
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-muted-foreground line-through tabular-nums">
              {formatKRW(product.original_price!)}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent-gold text-foreground text-xs font-bold">
              {discountPct}% OFF
            </span>
          </div>
        )}
        <p
          className={cn(
            "text-3xl font-bold tabular-nums",
            hasDiscount ? "text-accent-gold" : "text-foreground"
          )}
        >
          {formatKRW(totalPrice)}
        </p>
        {(optionMod !== 0 || qty > 1) && (
          <p className="mt-2 text-xs text-muted-foreground">
            기본 {formatKRW(product.price)}
            {optionMod !== 0 && (
              <> + 옵션 {formatSignedKRW(optionMod)}</>
            )}
            {qty > 1 && <> × {qty}</>}
          </p>
        )}
      </div>

      {/* ─── 옵션 선택 ─── */}
      {options.length > 0 && (
        <div className="mt-6 space-y-5">
          {options.map((opt) => (
            <div key={opt.name}>
              <p className="text-sm font-semibold mb-2">{opt.name}</p>
              <div className="flex flex-wrap gap-2">
                {opt.values.map((v) => {
                  const isActive = selected[opt.name] === v.label;
                  return (
                    <button
                      key={v.label}
                      type="button"
                      onClick={() =>
                        setSelected((s) => ({ ...s, [opt.name]: v.label }))
                      }
                      className={cn(
                        "inline-flex h-10 items-center gap-1.5 px-4 rounded-md border text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-accent-gold/10 border-accent-gold text-accent-gold"
                          : "bg-background border-border text-foreground hover:border-foreground/40"
                      )}
                    >
                      {isActive && <Check className="h-3.5 w-3.5" />}
                      {v.label}
                      {v.price_modifier !== 0 && (
                        <span className="text-xs opacity-70 tabular-nums">
                          {formatSignedKRW(v.price_modifier)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── 수량 조절 — +/- 버튼 + 직접 입력 ─── */}
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
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={9999}
            value={qty}
            onChange={(e) => {
              // 입력 중에는 빈 문자열 허용 → 0/NaN 은 1 로 정규화 (blur 처리)
              const raw = e.target.value;
              if (raw === "") {
                setQty(1);
                return;
              }
              const n = parseInt(raw, 10);
              if (Number.isFinite(n) && n >= 1) setQty(Math.min(n, 9999));
            }}
            aria-label="수량"
            className="w-14 h-full text-center font-semibold tabular-nums bg-transparent outline-none focus:bg-secondary/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(9999, q + 1))}
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
