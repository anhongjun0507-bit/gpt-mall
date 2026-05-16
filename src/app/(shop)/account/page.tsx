import Link from "next/link";
import {
  ShoppingBag,
  Wallet,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireUser, getCurrentProfile } from "@/lib/auth";
import { formatKRW } from "@/lib/format";
import { ORDER_STATUS_META } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import { formatOrderItemTitle } from "@/lib/order-display";
import type { Order } from "@/types/database";

export const metadata = { title: "마이페이지" };

// PostgREST embedded select 결과 — order_items 는 1:N 이라 배열.
type OrderWithItems = Order & {
  order_items: {
    product_name: string;
    selected_options: Record<string, string> | null;
  }[];
};

async function fetchUserOrders(userId: string): Promise<OrderWithItems[]> {
  // 마이페이지 한 사용자 한정이라 한 번에 다 받아 JS 에서 집계.
  // 향후 주문이 폭증하면 RPC (sum/count/limit) 로 최적화 가능.
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(product_name, selected_options)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as OrderWithItems[];
}

export default async function AccountHomePage() {
  const user = await requireUser({ next: "/account" });
  const profile = await getCurrentProfile();
  const displayName =
    profile?.display_name?.trim() ||
    user.email?.split("@")[0] ||
    "고객";

  let orders: OrderWithItems[] = [];
  try {
    orders = await fetchUserOrders(user.id);
  } catch (e) {
    console.error("[account/home] 조회 실패", e);
  }

  const totalCount = orders.length;
  // 누적 결제 금액 — 실제 결제 확정된 것만 (paid, delivered).
  const paidSum = orders
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((s, o) => s + o.total, 0);
  const lastOrderDate = orders[0]?.created_at ?? null;
  const recent3 = orders.slice(0, 3);

  // 빈 상태 — 통계·최근주문 섹션 숨기고 큰 안내 박스만.
  if (totalCount === 0) {
    return (
      <section className="space-y-8">
        <Heading variant="h2" className="!text-2xl md:!text-3xl">
          안녕하세요, {displayName}님
        </Heading>
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
      </section>
    );
  }

  const cards: Array<{ label: string; value: string; Icon: LucideIcon }> = [
    {
      label: "누적 주문 수",
      value: `${totalCount.toLocaleString("ko-KR")}건`,
      Icon: ShoppingBag,
    },
    {
      label: "누적 결제 금액",
      value: formatKRW(paidSum),
      Icon: Wallet,
    },
    {
      label: "최근 주문일",
      value: lastOrderDate
        ? new Date(lastOrderDate).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "-",
      Icon: CalendarClock,
    },
  ];

  return (
    <section className="space-y-10">
      <Heading variant="h2" className="!text-2xl md:!text-3xl">
        안녕하세요, {displayName}님
      </Heading>

      {/* 통계 3카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-2xl bg-card border border-border/50 p-6 transition-all duration-300 hover:border-accent-gold/40"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-accent-gold" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* 최근 주문 */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <Heading variant="h3" className="!text-xl">
            최근 주문
          </Heading>
          <Link
            href="/account/orders"
            className="text-sm text-muted-foreground hover:text-accent-gold transition-gold"
          >
            전체 보기 →
          </Link>
        </div>

        <ul className="space-y-3">
          {recent3.map((order) => {
            const meta = ORDER_STATUS_META[order.status];
            const firstRow = order.order_items?.[0];
            const firstItem = firstRow
              ? formatOrderItemTitle(
                  firstRow.product_name,
                  firstRow.selected_options
                )
              : "(상품 정보 없음)";
            const extraCount = Math.max(
              0,
              (order.order_items?.length ?? 0) - 1
            );
            return (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="block rounded-2xl bg-card border border-border/50 p-5 hover:border-accent-gold/40 hover:bg-accent-gold/5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">
                          {order.order_number}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold",
                            meta.className
                          )}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-2 font-medium truncate">
                        {firstItem}
                        {extraCount > 0 && (
                          <span className="text-muted-foreground">
                            {" "}
                            외 {extraCount}건
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="font-bold tabular-nums shrink-0">
                      {formatKRW(order.total)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  );
}
