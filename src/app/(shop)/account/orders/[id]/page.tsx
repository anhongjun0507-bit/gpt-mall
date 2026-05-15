import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  User,
  Phone,
  FileText,
  Wallet,
  Download,
  KeyRound,
  MessageCircle,
} from "lucide-react";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { formatKRW } from "@/lib/format";
import {
  ORDER_STATUS_META,
  getPaymentMethodLabel,
} from "@/lib/order-status";
import type { Order, OrderItem } from "@/types/database";

// 표준 UUID v4/v8 형식. 형식 안 맞으면 DB 조회 없이 즉시 차단.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata = { title: "주문 상세" };

interface PageProps {
  params: { id: string };
}

export default async function AccountOrderDetailPage({ params }: PageProps) {
  if (!UUID_RE.test(params.id)) notFound();

  const user = await requireUser({ next: `/account/orders/${params.id}` });

  let order: Order | null = null;
  let items: OrderItem[] = [];
  try {
    const supabase = createClient();
    const [orderRes, itemsRes] = await Promise.all([
      supabase.from("orders").select("*").eq("id", params.id).maybeSingle(),
      supabase.from("order_items").select("*").eq("order_id", params.id),
    ]);
    if (orderRes.error) throw orderRes.error;
    if (itemsRes.error) throw itemsRes.error;
    order = (orderRes.data as Order) ?? null;
    items = (itemsRes.data ?? []) as OrderItem[];
  } catch (e) {
    console.error("[account/orders/detail] 조회 실패", e);
    notFound();
  }

  // 권한 — 본인 주문 아니면 존재 자체 노출 안 함
  if (!order) notFound();
  if (order.user_id !== user.id) notFound();

  const meta = ORDER_STATUS_META[order.status];
  const itemsSubtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <section>
      <Link
        href="/account/orders"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-accent-gold transition-gold"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        주문 내역으로
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Heading variant="h2" className="!text-2xl">
            주문 상세
          </Heading>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm text-muted-foreground">
              {order.order_number}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleString("ko-KR")}
            </span>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold",
            meta.className
          )}
        >
          {meta.label}
        </span>
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        {/* 좌측 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 주문 상품 */}
          <section className="rounded-2xl bg-card border border-border/50 overflow-hidden">
            <header className="px-6 py-4 border-b border-border">
              <h3 className="text-h4 font-semibold">주문 상품</h3>
            </header>
            {items.length === 0 ? (
              <p className="p-6 text-muted-foreground">
                상품 정보를 불러올 수 없습니다.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((it) => (
                  <li key={it.id} className="p-6 flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-secondary overflow-hidden shrink-0">
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
                      <p className="font-medium">{it.product_name}</p>
                      {Object.keys(it.selected_options ?? {}).length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {Object.entries(it.selected_options)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatKRW(it.price)} × {it.qty}
                      </p>
                    </div>
                    <p className="font-semibold tabular-nums shrink-0">
                      {formatKRW(it.price * it.qty)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 주문자 정보 */}
          <section className="rounded-2xl bg-card border border-border/50 p-6">
            <h3 className="text-h4 font-semibold mb-4">주문자 정보</h3>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <dt className="text-xs text-muted-foreground">이름</dt>
                  <dd className="mt-0.5 font-medium">{order.recipient_name}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <dt className="text-xs text-muted-foreground">휴대전화</dt>
                  <dd className="mt-0.5 font-medium">{order.recipient_phone}</dd>
                </div>
              </div>
            </dl>
          </section>

          {/* 메모 */}
          {order.memo && (
            <section className="rounded-2xl bg-card border border-border/50 p-6">
              <header className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-h4 font-semibold">요청사항</h3>
              </header>
              <p className="text-sm whitespace-pre-line text-muted-foreground">
                {order.memo}
              </p>
            </section>
          )}

          {/* 영수증·세금계산서 — 가맹 후 활성화 */}
          <section className="rounded-2xl bg-card border border-border/50 p-6">
            <header className="flex items-center gap-2 mb-3">
              <Download className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-h4 font-semibold">영수증·세금계산서</h3>
            </header>
            <p className="text-sm text-muted-foreground">
              PG 가맹 승인 후 발행 가능합니다.
            </p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" disabled>
                영수증 다운로드
              </Button>
              <Button variant="outline" size="sm" disabled>
                세금계산서 요청
              </Button>
            </div>
          </section>
        </div>

        {/* 우측 — sticky */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* 결제 정보 */}
            <section className="rounded-2xl bg-card border border-border/50 p-6">
              <header className="flex items-center gap-2 mb-4">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-h4 font-semibold">결제 정보</h3>
              </header>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">결제 수단</dt>
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

            {/* 상태별 액션 */}
            <section className="rounded-2xl bg-card border border-border/50 p-6 space-y-3">
              <h3 className="text-h4 font-semibold">주문 액션</h3>
              {order.status === "pending" && (
                <>
                  <Button className="w-full" disabled>
                    결제하기
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    PG 가맹 승인 후 활성화됩니다.
                  </p>
                </>
              )}
              {(order.status === "paid" || order.status === "delivered") && (
                <>
                  <Button variant="outline" className="w-full" disabled>
                    <KeyRound className="h-4 w-4 mr-2" />
                    라이센스 다시 보기
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    라이센스 발급 모듈 준비 후 활성화됩니다.
                  </p>
                </>
              )}
              {(order.status === "cancelled" ||
                order.status === "refunded") && (
                <p className="text-sm text-muted-foreground">
                  이 주문에 대해 가능한 액션이 없습니다.
                </p>
              )}
              <Button variant="ghost" className="w-full" disabled>
                <MessageCircle className="h-4 w-4 mr-2" />
                고객센터 문의
              </Button>
            </section>
          </div>
        </aside>
      </div>
    </section>
  );
}
