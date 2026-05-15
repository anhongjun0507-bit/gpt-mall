import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  ALL_ORDER_STATUSES,
  ORDER_STATUS_META,
} from "@/lib/order-status";
import type { OrderStatus } from "@/types/database";

// 상태 필터 — 좌측 "전체" + 5개 상태. Server Component, Link 기반.
export function OrderStatusFilter({
  active,
  counts,
}: {
  active: OrderStatus | "";
  counts: Record<OrderStatus | "all", number>;
}) {
  const items = [
    { key: "" as const, label: "전체", count: counts.all },
    ...ALL_ORDER_STATUSES.map((s) => ({
      key: s,
      label: ORDER_STATUS_META[s].label,
      count: counts[s],
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {items.map((it) => {
        const isActive = active === it.key;
        const href = it.key ? `/admin/orders?status=${it.key}` : "/admin/orders";
        return (
          <Link
            key={it.key || "all"}
            href={href}
            className={cn(
              "inline-flex h-9 items-center gap-2 px-4 rounded-md border text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-accent-gold/10 border-accent-gold text-accent-gold"
                : "bg-background border-border text-foreground hover:border-foreground/40"
            )}
          >
            {it.label}
            <span
              className={cn(
                "tabular-nums text-xs",
                isActive ? "text-accent-gold" : "text-muted-foreground"
              )}
            >
              {it.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
