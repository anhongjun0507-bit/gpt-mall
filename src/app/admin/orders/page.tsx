import Link from "next/link";
import { Eye } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatKRW } from "@/lib/format";
import {
  ORDER_STATUS_META,
  ALL_ORDER_STATUSES,
  isValidOrderStatus,
  getPaymentMethodLabel,
} from "@/lib/order-status";
import { OrderStatusFilter } from "@/components/admin/OrderStatusFilter";
import type { Order, OrderStatus } from "@/types/database";

export const metadata = { title: "주문 관리" };

interface PageProps {
  searchParams: { status?: string };
}

// 상태별 카운트 + 필터링된 주문 목록을 동시에 가져옴.
async function fetchData(activeStatus: OrderStatus | "") {
  const supabase = createClient();

  // 모든 주문의 status 만 가져와서 카운트 계산 (테이블 작을 때 OK)
  const [allRes, listRes] = await Promise.all([
    supabase.from("orders").select("status"),
    (() => {
      let q = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (activeStatus) q = q.eq("status", activeStatus);
      return q;
    })(),
  ]);

  const counts: Record<OrderStatus | "all", number> = {
    all: 0,
    pending: 0,
    paid: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  };
  for (const row of allRes.data ?? []) {
    counts.all++;
    counts[row.status as OrderStatus]++;
  }

  return {
    orders: (listRes.data ?? []) as Order[],
    counts,
  };
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const activeStatus: OrderStatus | "" =
    searchParams.status && isValidOrderStatus(searchParams.status)
      ? searchParams.status
      : "";

  const { orders, counts } = await fetchData(activeStatus);

  return (
    <>
      <div>
        <Heading variant="h2" className="!text-2xl">
          주문 관리
        </Heading>
        <p className="mt-2 text-muted-foreground">총 {counts.all}개</p>
      </div>

      {/* 상태 필터 */}
      <div className="mt-8">
        <OrderStatusFilter active={activeStatus} counts={counts} />
      </div>

      {/* 테이블 또는 빈 상태 */}
      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-card border border-border/50 p-6 sm:p-12 text-center">
          <p className="text-muted-foreground">
            {activeStatus
              ? `'${ORDER_STATUS_META[activeStatus].label}' 상태의 주문이 없습니다.`
              : "아직 주문이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 sm:px-5 py-3 font-medium whitespace-nowrap">주문번호</th>
                  <th className="text-left px-4 sm:px-5 py-3 font-medium whitespace-nowrap">일시</th>
                  <th className="text-left px-4 sm:px-5 py-3 font-medium whitespace-nowrap">구매자</th>
                  <th className="text-left px-4 sm:px-5 py-3 font-medium whitespace-nowrap">결제수단</th>
                  <th className="text-right px-4 sm:px-5 py-3 font-medium whitespace-nowrap">금액</th>
                  <th className="text-center px-4 sm:px-5 py-3 font-medium whitespace-nowrap">상태</th>
                  <th className="text-right px-4 sm:px-5 py-3 font-medium w-16 whitespace-nowrap">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => {
                  const meta = ORDER_STATUS_META[o.status];
                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-accent-gold/5 transition-colors duration-200"
                    >
                      <td className="px-4 sm:px-5 py-3 font-mono text-xs whitespace-nowrap">
                        {o.order_number}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(o.created_at).toLocaleString("ko-KR", {
                          year: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                        <div className="font-medium">{o.recipient_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {o.recipient_phone}
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-muted-foreground whitespace-nowrap">
                        {getPaymentMethodLabel(o.payment_method)}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-right font-semibold tabular-nums whitespace-nowrap">
                        {formatKRW(o.total)}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-center whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold",
                            meta.className
                          )}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-right whitespace-nowrap">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          aria-label={`${o.order_number} 상세`}
                          className="text-muted-foreground hover:text-accent-gold"
                        >
                          <Link href={`/admin/orders/${o.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

// 미사용 import 가드 (다른 모듈이 ALL_ORDER_STATUSES 를 참조하므로 tree-shaking 안 되도록).
void ALL_ORDER_STATUSES;
