import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, User, Mail, Phone, FileText, Wallet } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils";
import { formatKRW } from "@/lib/format";
import {
  ORDER_STATUS_META,
  getPaymentMethodLabel,
} from "@/lib/order-status";
import { OrderStatusChanger } from "@/components/admin/OrderStatusChanger";
import type { Order, OrderItem } from "@/types/database";

export const metadata = { title: "주문 상세" };

interface PageProps {
  params: { id: string };
}

async function fetchOrderWithItems(id: string) {
  const supabase = createClient();
  const [orderRes, itemsRes] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);
  if (orderRes.error) throw orderRes.error;
  if (itemsRes.error) throw itemsRes.error;
  return {
    order: (orderRes.data as Order) ?? null,
    items: (itemsRes.data ?? []) as OrderItem[],
  };
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { order, items } = await fetchOrderWithItems(params.id);
  if (!order) notFound();

  const meta = ORDER_STATUS_META[order.status];
  const itemsSubtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-accent-gold transition-gold"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          주문 목록으로
        </Link>

        <div className="mt-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <Heading variant="h2" className="!text-2xl">
              주문 상세
            </Heading>
            <div className="mt-2 flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-mono text-sm text-muted-foreground break-all">
                {order.order_number}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleString("ko-KR")}
              </span>
            </div>
          </div>
          <div className="self-start sm:self-auto">
            <OrderStatusChanger orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        {/* 좌측 2/3 — 상품 + 메모 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 주문 상품 */}
          <section className="rounded-2xl bg-card border border-border/50 overflow-hidden">
            <header className="px-4 sm:px-6 py-4 border-b border-border">
              <h3 className="text-h4 font-semibold">주문 상품</h3>
            </header>
            {items.length === 0 ? (
              <p className="p-6 text-muted-foreground">상품 없음</p>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((it) => (
                  <li key={it.id} className="p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-secondary overflow-hidden shrink-0">
                      {it.product_image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.product_image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium break-words">{it.product_name}</p>
                      {Object.keys(it.selected_options ?? {}).length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground break-words">
                          {Object.entries(it.selected_options)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatKRW(it.price)} × {it.qty}
                      </p>
                    </div>
                    <p className="font-semibold tabular-nums shrink-0 text-right">
                      {formatKRW(it.price * it.qty)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 배송 메모 */}
          {order.memo && (
            <section className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6">
              <header className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-h4 font-semibold">배송 메모</h3>
              </header>
              <p className="text-body whitespace-pre-line text-muted-foreground">
                {order.memo}
              </p>
            </section>
          )}
        </div>

        {/* 우측 1/3 — 구매자 + 결제 */}
        <aside className="space-y-6">
          {/* 구매자 */}
          <section className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6">
            <h3 className="text-h4 font-semibold mb-4">구매자</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <dt className="text-xs text-muted-foreground">이름</dt>
                  <dd className="font-medium">{order.recipient_name}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">이메일</dt>
                  <dd className="font-medium truncate">{order.recipient_email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <dt className="text-xs text-muted-foreground">연락처</dt>
                  <dd className="font-medium">{order.recipient_phone}</dd>
                </div>
              </div>
            </dl>
          </section>

          {/* 결제 */}
          <section className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6">
            <header className="flex items-center gap-2 mb-4">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-h4 font-semibold">결제</h3>
            </header>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">수단</dt>
                <dd>{getPaymentMethodLabel(order.payment_method)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">상품 합계</dt>
                <dd className="tabular-nums">{formatKRW(itemsSubtotal)}</dd>
              </div>
              <div className="pt-3 mt-3 border-t border-border flex justify-between items-baseline">
                <dt className="font-semibold">결제 금액</dt>
                <dd className="text-lg font-bold tabular-nums">
                  {formatKRW(order.total)}
                </dd>
              </div>
              {order.paid_at && (
                <p className="text-xs text-muted-foreground pt-2">
                  결제 완료: {new Date(order.paid_at).toLocaleString("ko-KR")}
                </p>
              )}
            </dl>
          </section>

          {/* 현재 상태 카드 */}
          <section
            className={cn(
              "rounded-2xl border p-4 sm:p-5",
              meta.className.includes("bg-accent-gold")
                ? "bg-accent-gold/5 border-accent-gold/30"
                : "bg-card border-border/50"
            )}
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              현재 상태
            </p>
            <p className="mt-2">
              <span
                className={cn(
                  "inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold",
                  meta.className
                )}
              >
                {meta.label}
              </span>
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
