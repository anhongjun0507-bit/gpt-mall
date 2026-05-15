import type { OrderStatus, PaymentMethod } from "@/types/database";

// 주문 상태 표시용 메타 — 라벨, 톤 클래스, 다음 가능한 상태들.
// 한 곳에서만 관리해 대시보드/리스트/상세 등에서 공유.

export interface OrderStatusMeta {
  label: string;
  className: string;
  // 이 상태에서 전환 가능한 다음 상태들 (운영자 액션)
  transitions: OrderStatus[];
}

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  pending: {
    label: "결제 대기",
    className: "bg-secondary text-muted-foreground",
    transitions: ["paid", "cancelled"],
  },
  paid: {
    label: "결제 완료",
    className: "bg-accent-gold/10 text-accent-gold",
    transitions: ["delivered", "refunded"],
  },
  delivered: {
    label: "발급 완료",
    className: "bg-foreground text-background",
    transitions: ["refunded"],
  },
  cancelled: {
    label: "취소",
    className: "bg-secondary text-muted-foreground",
    transitions: [],
  },
  refunded: {
    label: "환불",
    className: "bg-destructive/10 text-destructive",
    transitions: [],
  },
};

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "delivered",
  "cancelled",
  "refunded",
];

export function getOrderStatusMeta(status: OrderStatus): OrderStatusMeta {
  return ORDER_STATUS_META[status];
}

export function isValidOrderStatus(s: string): s is OrderStatus {
  return ALL_ORDER_STATUSES.includes(s as OrderStatus);
}

// 결제 수단 한글 라벨 — 알림톡 등에서도 재사용.
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  kakaopay: "카카오페이",
  naverpay: "네이버페이",
  card: "신용카드",
};

export function getPaymentMethodLabel(m: PaymentMethod | null): string {
  return m ? PAYMENT_METHOD_LABELS[m] : "미지정";
}
