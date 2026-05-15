import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { CircleCheck } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatKRW } from "@/lib/format";
import { getPaymentMethodLabel } from "@/lib/order-status";
import type { Order, OrderItem } from "@/types/database";

import { CartClearer } from "./CartClearer";

export const metadata = { title: "주문 완료" };

// 주문번호 형식 — createOrder() 의 generateOrderNumber() 와 일치해야 함.
// ORD-YYYYMMDD-XXXX (대문자 hex 4자리)
const ORDER_NUMBER_RE = /^ORD-\d{8}-[0-9A-F]{4}$/;

interface PageProps {
  searchParams: { order_number?: string };
}

export default async function OrderCompletePage({ searchParams }: PageProps) {
  const orderNumber = searchParams.order_number;
  // 형식 검증 — 누락/형식 이상 시 메인으로
  if (!orderNumber || !ORDER_NUMBER_RE.test(orderNumber)) {
    redirect("/");
  }

  const supabase = createClient();
  const user = await getCurrentUser();

  let order: Order | null = null;
  let items: OrderItem[] = [];
  try {
    const { data: orderData, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (orderErr) throw orderErr;
    order = (orderData as Order) ?? null;

    if (order) {
      const { data: itemData, error: itemErr } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);
      if (itemErr) throw itemErr;
      items = (itemData ?? []) as OrderItem[];
    }
  } catch (e) {
    console.error("[order/complete] 조회 실패", e);
    // 존재 여부 노출 방지 — 모든 실패는 동일하게 notFound 처리
    notFound();
  }

  if (!order) notFound();

  // 접근 권한 — 정보 누출 방지 위해 차단 케이스는 전부 동일하게 notFound().
  //   1) 로그인 사용자: 본인 주문(user_id 일치)만 허용
  //   2) 미로그인  : 비회원 주문(user_id null)만 허용
  // TODO: 비회원 주문은 쿠키에 last_order_number 저장 후 매칭으로 추가 보호 가능.
  if (user) {
    if (order.user_id !== user.id) notFound();
  } else {
    if (order.user_id !== null) notFound();
  }

  return (
    <Container className="py-16 md:py-24">
      <CartClearer />

      <div className="max-w-3xl mx-auto">
        {/* 헤더 — 체크 아이콘 + 타이틀 + 주문번호 */}
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full p-4 bg-accent-gold/10">
            <CircleCheck
              className="h-16 w-16 text-accent-gold"
              strokeWidth={1.5}
            />
          </div>
          <Heading variant="h2" className="mt-6 !text-2xl md:!text-3xl">
            주문이 접수되었습니다
          </Heading>
          <p className="mt-3 font-mono text-sm md:text-base text-muted-foreground">
            주문번호 · {order.order_number}
          </p>
        </div>

        {/* 가맹 승인 대기 안내 */}
        <section
          role="status"
          className="mt-10 rounded-2xl border border-accent-gold/30 bg-accent-gold/5 px-5 py-4 text-sm leading-relaxed"
        >
          <p className="font-semibold">결제 가맹 승인 대기 중입니다</p>
          <p className="mt-1 text-muted-foreground">
            현재 PG 가맹 승인을 진행 중이라 결제는 임시로 보류된 상태예요.
            승인이 완료되는 즉시 입력하신 이메일로 결제 안내를 보내드립니다.
          </p>
        </section>

        {/* 주문 상품 */}
        <section className="mt-8 rounded-2xl bg-card border border-border/50 overflow-hidden">
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
          <div className="px-6 py-4 border-t border-border flex justify-between items-baseline">
            <p className="text-sm text-muted-foreground">
              결제 수단 · {getPaymentMethodLabel(order.payment_method)}
            </p>
            <p className="text-lg font-bold tabular-nums">
              {formatKRW(order.total)}
            </p>
          </div>
        </section>

        {/* 주문자 정보 */}
        <section className="mt-6 rounded-2xl bg-card border border-border/50 p-6">
          <h3 className="text-h4 font-semibold">주문자 정보</h3>
          <dl className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">이름</dt>
              <dd className="mt-1 font-medium">{order.recipient_name}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">이메일</dt>
              <dd className="mt-1 font-medium truncate">
                {order.recipient_email}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">연락처</dt>
              <dd className="mt-1 font-medium">{order.recipient_phone}</dd>
            </div>
          </dl>
        </section>

        {/* 라이센스 발급 안내 */}
        <section className="mt-6 rounded-2xl bg-card border border-border/50 p-6 text-sm leading-relaxed">
          <h3 className="text-h4 font-semibold">라이센스 발급 안내</h3>
          <p className="mt-3 text-muted-foreground">
            결제가 확정되면 라이센스 키가 자동 발급되어 마이페이지에서 확인하실
            수 있습니다. 발급 후 안내 이메일도 함께 보내드려요.
          </p>
        </section>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:justify-center">
          {user && (
            <Button asChild className="sm:w-56">
              <Link href="/account/orders">주문 내역 보기</Link>
            </Button>
          )}
          <Button
            asChild
            variant={user ? "outline" : "default"}
            className="sm:w-56"
          >
            <Link href="/products">쇼핑 계속하기</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
