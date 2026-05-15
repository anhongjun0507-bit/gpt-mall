"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";

import { createServiceRoleClient } from "@/lib/supabase/service";
import { getCurrentUser } from "@/lib/auth";
import type { CartItem } from "@/lib/cart";

import { checkoutSchema, type CheckoutValues } from "./schema";

export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  redirect?: string;
}

// 주문번호 — ORD-YYYYMMDD-{4자리 hex}. 같은 날 65536개까지 충돌 거의 없음.
// unique 제약은 DB 에 걸려 있으므로, 만약의 충돌은 INSERT 단계에서 잡힘.
function generateOrderNumber(): string {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = randomBytes(2).toString("hex").toUpperCase();
  return `ORD-${ymd}-${random}`;
}

export async function createOrder(
  values: CheckoutValues,
  cartItems: CartItem[]
): Promise<ActionResult> {
  // 1) 폼 검증
  const parsed = checkoutSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // 2) 카트 검증
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { ok: false, message: "장바구니가 비어있습니다" };
  }

  try {
    // service_role 사용 이유: 비회원(user_id=null) 흐름에서 RETURNING 의 SELECT RLS
    // 통과가 불가능. 가격·재고·user_id 위조 방지는 아래 server-side 코드가 책임진다.
    const supabase = createServiceRoleClient();

    // 3) 상품 검증 — DB 에서 직접 fetch (클라이언트 데이터 위조 방지)
    //    스냅샷용 name/image 도 DB 값 사용 (신뢰 가능 출처).
    const productIds = Array.from(new Set(cartItems.map((i) => i.productId)));
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price, image_url, stock, is_active")
      .in("id", productIds);
    if (prodErr) throw prodErr;

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of cartItems) {
      const p = productMap.get(item.productId);
      if (!p) {
        return { ok: false, message: `상품을 찾을 수 없습니다 (${item.name})` };
      }
      if (!p.is_active) {
        return {
          ok: false,
          message: `판매 중지된 상품입니다 (${p.name}). 장바구니에서 제거해주세요.`,
        };
      }
      if (p.price !== item.price) {
        return {
          ok: false,
          message: `가격이 변경되었습니다 (${p.name}). 장바구니를 새로고침해주세요.`,
        };
      }
      if (p.stock < item.qty) {
        return {
          ok: false,
          message: `재고가 부족합니다 (${p.name}, 재고 ${p.stock}개)`,
        };
      }
    }

    // 4) 결제 금액 — 신뢰 가능한 DB 가격으로 재계산
    const total = cartItems.reduce((sum, item) => {
      const p = productMap.get(item.productId)!;
      return sum + p.price * item.qty;
    }, 0);

    // 5) 주문자 / 주문번호
    const user = await getCurrentUser();
    const orderNumber = generateOrderNumber();

    // 6) orders insert
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user?.id ?? null,
        total,
        status: "pending",
        payment_method: parsed.data.payment_method,
        recipient_name: parsed.data.recipient_name,
        recipient_email: parsed.data.recipient_email,
        recipient_phone: parsed.data.recipient_phone,
        // 카톡 ID 가 있으면 memo 에 함께 기록 (별도 컬럼 신설 안 함 — 추후 확장 가능)
        memo: [
          parsed.data.kakao_id ? `카카오톡: ${parsed.data.kakao_id}` : null,
          parsed.data.memo,
        ]
          .filter(Boolean)
          .join("\n") || null,
      })
      .select("id")
      .single();
    if (orderErr) throw orderErr;

    // 7) order_items — 모두 DB 값으로 스냅샷
    const itemRows = cartItems.map((item) => {
      const p = productMap.get(item.productId)!;
      return {
        order_id: order.id,
        product_id: item.productId,
        product_name: p.name,
        product_image: p.image_url,
        price: p.price,
        qty: item.qty,
        selected_options: item.selectedOptions,
      };
    });

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(itemRows);
    if (itemsErr) {
      // 롤백: order 도 삭제 (FK cascade 안 하면 고아 order 남음)
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsErr;
    }

    revalidatePath("/account/orders");
    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    // ─── 결제 모듈 끼워넣을 자리 ───────────────────────────
    // 가맹 승인 후 PG SDK 결제창 호출은 클라이언트 측에서.
    // 흐름: createOrder() 가 ok=true 로 응답 → 클라이언트가 PG SDK 결제창 띄움
    //       → 결제 성공 콜백에서 별도 액션 markOrderPaid(orderId, pg_tx_id) 호출
    //       → 그때 orders.status='paid', paid_at=now() 셋 + 알림톡 트리거
    //
    // 현재는 결제 모듈 없으므로 pending 상태로 두고 완료 페이지로 이동.
    // ────────────────────────────────────────────────────

    return {
      ok: true,
      redirect: `/order/complete?order_number=${encodeURIComponent(orderNumber)}`,
    };
  } catch (e) {
    console.error("[createOrder] 실패", e);
    return {
      ok: false,
      message: "주문 생성에 실패했어요. 잠시 후 다시 시도해주세요.",
    };
  }
}

// ──────────────────────────────────────────────────────────────────────
// markOrderPaid — 결제 완료 시 호출될 Server Action (placeholder).
//
// 현재는 PG 가맹 승인 대기 단계라 동작 없이 noop 으로 반환한다.
// 가맹 승인 + PG SDK 연동 후 아래 TODO 단계의 로직을 채워 넣을 것.
//
// 호출 흐름 (예정):
//   클라이언트 결제창 성공 콜백 → markOrderPaid(orderId, pgTxId)
//   → 1)~6) 수행 → ok: true → 클라이언트가 /order/complete 로 이동
//   (혹은 /order/complete 가 status 에 따라 분기 표시)
//
// TODO (PG 가맹 승인 후 추가):
//   1) pgTxId 로 PG 사 결제 결과 서버 검증
//      — 클라이언트 콜백만 믿지 말고 PG REST 로 한 번 더 조회/대조 (금액·주문번호)
//   2) orders 업데이트: status='paid', paid_at=now()
//   3) 재고 차감 (createOrder 시점에 차감하지 않았다면 여기서 확정)
//   4) 라이센스 키 발급 (licenses 테이블 insert)
//   5) 알림톡 트리거
//      — Supabase Database Webhook 으로 잡거나 (docs/NOTIFICATION_PLAN.md 참고)
//        또는 여기서 /api/notifications/order-paid 를 직접 호출
//   6) revalidatePath('/account/orders'), revalidatePath('/admin/orders')
// ──────────────────────────────────────────────────────────────────────
export async function markOrderPaid(
  orderId: string,
  pgTxId: string
): Promise<ActionResult> {
  // PG 연동 후 위 1)~6) 로직 채워 넣을 것.
  // 인자는 그때 사용하므로 시그니처는 그대로 유지.
  void orderId;
  void pgTxId;

  return {
    ok: false,
    message: "결제 모듈 준비 중입니다. 가맹 승인 후 활성화됩니다.",
  };
}
