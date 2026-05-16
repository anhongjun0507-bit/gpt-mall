import Link from "next/link";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { formatKRW } from "@/lib/format";
import { formatOrderItemTitle } from "@/lib/order-display";
import { ORDER_STATUS_META, isValidOrderStatus } from "@/lib/order-status";
import type { Order, OrderStatus } from "@/types/database";

import { OrderSort } from "@/components/account/OrderSort";

export const metadata = { title: "주문 내역" };

const PAGE_SIZE = 10;

const FILTERS: { key: OrderStatus | null; label: string }[] = [
  { key: null, label: "전체" },
  { key: "pending", label: "결제 대기" },
  { key: "paid", label: "결제 완료" },
  { key: "delivered", label: "발급 완료" },
  { key: "cancelled", label: "취소" },
];

type OrderWithItems = Order & {
  order_items: {
    product_name: string;
    product_image: string | null;
    selected_options: Record<string, string> | null;
  }[];
};

interface PageProps {
  searchParams: { status?: string; sort?: string; page?: string };
}

export default async function AccountOrdersPage({ searchParams }: PageProps) {
  const user = await requireUser({ next: "/account/orders" });

  // ── searchParams 파싱·정규화 ───────────────────────────────
  const status: OrderStatus | null =
    searchParams.status && isValidOrderStatus(searchParams.status)
      ? (searchParams.status as OrderStatus)
      : null;
  const sort: "asc" | "desc" = searchParams.sort === "asc" ? "asc" : "desc";
  const pageNum = (() => {
    const n = parseInt(searchParams.page ?? "1", 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  })();

  // ── 조회 ───────────────────────────────────────────────
  let orders: OrderWithItems[] = [];
  let totalCount = 0;
  try {
    const supabase = createClient();
    let q = supabase
      .from("orders")
      .select("*, order_items(product_name, product_image, selected_options)", {
        count: "exact",
      })
      .eq("user_id", user.id);
    if (status) q = q.eq("status", status);
    const { data, count, error } = await q
      .order("created_at", { ascending: sort === "asc" })
      .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1);
    if (error) throw error;
    orders = (data ?? []) as unknown as OrderWithItems[];
    totalCount = count ?? 0;
  } catch (e) {
    console.error("[account/orders] 조회 실패", e);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function buildHref(opts: {
    status?: OrderStatus | null;
    page?: number;
  }): string {
    const params = new URLSearchParams();
    const s = "status" in opts ? opts.status : status;
    const p = opts.page ?? 1;
    if (s) params.set("status", s);
    if (sort !== "desc") params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `?${qs}` : "/account/orders";
  }

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <Heading variant="h2" className="!text-2xl">
          주문 내역
        </Heading>
        <OrderSort current={sort} />
      </div>

      {/* 필터 탭 */}
      <nav className="border-b border-border overflow-x-auto -mx-4 px-4">
        <ul className="flex gap-1 whitespace-nowrap">
          {FILTERS.map((f) => {
            const active = (f.key ?? null) === status;
            return (
              <li key={f.key ?? "all"}>
                <Link
                  href={buildHref({ status: f.key })}
                  className={cn(
                    "inline-block px-4 py-3 text-sm transition-colors border-b-2",
                    active
                      ? "border-accent-gold text-accent-gold font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 카드 리스트 / 빈 상태 */}
      {orders.length === 0 ? (
        status === null ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <ShoppingBag
              className="h-10 w-10 mx-auto text-muted-foreground"
              strokeWidth={1.5}
            />
            <p className="mt-4 font-medium">아직 주문 내역이 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">
              마음에 드는 AI 도구를 찾아보세요.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">상품 둘러보기</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">이 상태의 주문이 없어요.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/account/orders">전체 보기</Link>
            </Button>
          </div>
        )
      ) : (
        <>
          <ul className="space-y-3">
            {orders.map((order) => {
              const meta = ORDER_STATUS_META[order.status];
              const items = order.order_items ?? [];
              const firstName = items[0]
                ? formatOrderItemTitle(
                    items[0].product_name,
                    items[0].selected_options
                  )
                : "(상품 정보 없음)";
              const extra = Math.max(0, items.length - 1);

              return (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="block rounded-2xl bg-card border border-border/50 p-5 hover:border-accent-gold/40 hover:bg-accent-gold/5 transition-all duration-200"
                  >
                    {/* 상단 */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="font-mono text-xs text-muted-foreground">
                          {order.order_number}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold",
                          meta.className
                        )}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {/* 본문 — 썸네일 가로 + 상품명 */}
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex gap-2 overflow-x-auto shrink-0">
                        {items.slice(0, 4).map((it, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0"
                          >
                            {it.product_image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={it.product_image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="flex-1 min-w-0 font-medium truncate">
                        {firstName}
                        {extra > 0 && (
                          <span className="text-muted-foreground">
                            {" "}
                            외 {extra}건
                          </span>
                        )}
                      </p>
                    </div>

                    {/* 하단 — 총액 + CTA */}
                    <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
                      <p className="font-bold tabular-nums">
                        {formatKRW(order.total)}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        주문 상세 보기 →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-3 pt-4">
              {pageNum > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={buildHref({ page: pageNum - 1 })}>
                    <ChevronLeft className="h-4 w-4" /> 이전
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" /> 이전
                </Button>
              )}
              <span className="text-sm tabular-nums">
                <span className="font-semibold">{pageNum}</span>
                <span className="text-muted-foreground"> / {totalPages}</span>
              </span>
              {pageNum < totalPages ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={buildHref({ page: pageNum + 1 })}>
                    다음 <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  다음 <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </nav>
          )}
        </>
      )}
    </section>
  );
}
