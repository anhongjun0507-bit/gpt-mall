"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { isValidOrderStatus, ORDER_STATUS_META } from "@/lib/order-status";
import type { OrderStatus } from "@/types/database";

export interface ActionResult {
  ok: boolean;
  message?: string;
}

// 주문 상태 변경 — admin 만. 정의된 transition 규칙을 따른다.
// paid 로 전환 시 paid_at 도 함께 셋.
export async function updateOrderStatus(
  orderId: string,
  nextStatus: string
): Promise<ActionResult> {
  await requireAdmin();

  if (!isValidOrderStatus(nextStatus)) {
    return { ok: false, message: "유효하지 않은 상태입니다" };
  }

  try {
    const supabase = createClient();

    // 현재 상태 확인 (transition 검증)
    const { data: current, error: fetchErr } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!current) return { ok: false, message: "주문을 찾을 수 없습니다" };

    const allowed = ORDER_STATUS_META[current.status as OrderStatus].transitions;
    if (!allowed.includes(nextStatus as OrderStatus)) {
      return {
        ok: false,
        message: `${current.status} → ${nextStatus} 전환은 허용되지 않습니다`,
      };
    }

    // 업데이트 페이로드
    const payload: { status: OrderStatus; paid_at?: string } = {
      status: nextStatus as OrderStatus,
    };
    if (nextStatus === "paid") {
      payload.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", orderId);
    if (error) throw error;
  } catch (e) {
    console.error("[updateOrderStatus] 실패", e);
    return { ok: false, message: "상태 변경에 실패했습니다" };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return { ok: true, message: "상태가 변경되었습니다" };
}
