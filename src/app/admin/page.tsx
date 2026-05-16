import Link from "next/link";
import { Package, PackageCheck, ShoppingCart, Wallet, type LucideIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/database";

export const metadata = { title: "대시보드" };

const formatKRW = (v: number) => `₩${v.toLocaleString("ko-KR")}`;

// KST(UTC+9) 기준 오늘 00:00:00 의 ISO 문자열 — orders.created_at 비교용.
function getKstTodayStartIso(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA → 'YYYY-MM-DD' 형식
  return `${fmt.format(new Date())}T00:00:00+09:00`;
}

// 주문 상태 한글 라벨 + 톤
const STATUS_META: Record<
  Order["status"],
  { label: string; className: string }
> = {
  pending: { label: "결제 대기", className: "bg-secondary text-muted-foreground" },
  paid: { label: "결제 완료", className: "bg-accent-gold/10 text-accent-gold" },
  delivered: { label: "발급 완료", className: "bg-foreground text-background" },
  cancelled: { label: "취소", className: "bg-secondary text-muted-foreground line-through" },
  refunded: { label: "환불", className: "bg-destructive/10 text-destructive" },
};

interface Stats {
  productsTotal: number;
  productsActive: number;
  ordersToday: number;
  revenueTotal: number;
}

async function fetchStats(): Promise<Stats> {
  const supabase = createClient();
  const todayStart = getKstTodayStartIso();

  // 네 개 병렬 호출
  const [productsAll, productsActive, ordersToday, revenueRows] =
    await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart),
      supabase
        .from("orders")
        .select("total")
        .in("status", ["paid", "delivered"]),
    ]);

  const revenue =
    revenueRows.data?.reduce((sum, r) => sum + (r.total ?? 0), 0) ?? 0;

  return {
    productsTotal: productsAll.count ?? 0,
    productsActive: productsActive.count ?? 0,
    ordersToday: ordersToday.count ?? 0,
    revenueTotal: revenue,
  };
}

async function fetchRecentOrders(): Promise<Order[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) throw error;
    return (data ?? []) as Order[];
  } catch (e) {
    console.error("[admin/dashboard] 최근 주문 조회 실패", e);
    return [];
  }
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    fetchStats(),
    fetchRecentOrders(),
  ]);

  const cards: Array<{
    label: string;
    value: string;
    Icon: LucideIcon;
  }> = [
    {
      label: "총 상품 수",
      value: stats.productsTotal.toLocaleString("ko-KR"),
      Icon: Package,
    },
    {
      label: "활성 상품",
      value: stats.productsActive.toLocaleString("ko-KR"),
      Icon: PackageCheck,
    },
    {
      label: "오늘 주문",
      value: stats.ordersToday.toLocaleString("ko-KR"),
      Icon: ShoppingCart,
    },
    {
      label: "누적 매출",
      value: formatKRW(stats.revenueTotal),
      Icon: Wallet,
    },
  ];

  return (
    <>
      <div>
        <Heading variant="h2" className="!text-2xl">
          대시보드
        </Heading>
        <p className="mt-2 text-muted-foreground">
          오늘은 {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </p>
      </div>

      {/* ─── 통계 카드 4개 ─── */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {cards.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 transition-all duration-300 hover:border-accent-gold/40 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-accent-gold" />
              </div>
            </div>
            <p className="mt-3 sm:mt-4 text-xl sm:text-3xl font-bold tabular-nums break-all">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ─── 최근 주문 ─── */}
      <section className="mt-12">
        <div className="flex items-end justify-between mb-6">
          <Heading variant="h3" className="!text-xl">
            최근 주문
          </Heading>
          <Link
            href="/admin/orders"
            className="text-sm text-muted-foreground hover:text-accent-gold transition-gold"
          >
            전체 보기 →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border/50 p-6 sm:p-12 text-center">
            <p className="text-muted-foreground">아직 주문이 없습니다.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 sm:px-6 py-3 font-medium whitespace-nowrap">주문번호</th>
                    <th className="text-left px-4 sm:px-6 py-3 font-medium whitespace-nowrap">일시</th>
                    <th className="text-left px-4 sm:px-6 py-3 font-medium whitespace-nowrap">구매자</th>
                    <th className="text-right px-4 sm:px-6 py-3 font-medium whitespace-nowrap">금액</th>
                    <th className="text-right px-4 sm:px-6 py-3 font-medium whitespace-nowrap">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((o) => {
                    const meta = STATUS_META[o.status];
                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-accent-gold/5 transition-colors duration-200"
                      >
                        <td className="px-4 sm:px-6 py-4 font-mono text-xs whitespace-nowrap">
                          {o.order_number}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-muted-foreground whitespace-nowrap">
                          {new Date(o.created_at).toLocaleString("ko-KR", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{o.recipient_name}</td>
                        <td className="px-4 sm:px-6 py-4 text-right font-semibold tabular-nums whitespace-nowrap">
                          {formatKRW(o.total)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold",
                              meta.className
                            )}
                          >
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
