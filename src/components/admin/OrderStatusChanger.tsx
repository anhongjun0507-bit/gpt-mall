"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { ORDER_STATUS_META } from "@/lib/order-status";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import type { OrderStatus } from "@/types/database";

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

// 상태 변경 드롭다운 — 현재 상태에서 전환 가능한 옵션만 표시.
// transition 규칙 위반 시 서버에서도 한 번 더 검증.
export function OrderStatusChanger({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const meta = ORDER_STATUS_META[currentStatus];
  const transitions = meta.transitions;

  async function handleChange(next: OrderStatus) {
    setPending(true);
    try {
      const result = await updateOrderStatus(orderId, next);
      if (result.ok) {
        toast({ title: result.message ?? "상태 변경됨" });
        router.refresh();
      } else {
        toast({
          title: result.message ?? "변경 실패",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("[OrderStatusChanger] 실패", e);
      toast({ title: "오류가 발생했어요", variant: "destructive" });
    } finally {
      setPending(false);
    }
  }

  // 더 이상 전환 불가한 종료 상태
  if (transitions.length === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold",
          meta.className
        )}
      >
        <Check className="h-3.5 w-3.5 mr-1.5" />
        {meta.label}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          className="gap-2"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold",
              meta.className
            )}
          >
            {meta.label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {transitions.map((s) => {
          const nextMeta = ORDER_STATUS_META[s];
          return (
            <DropdownMenuItem
              key={s}
              onSelect={() => void handleChange(s)}
              className="gap-2"
            >
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold",
                  nextMeta.className
                )}
              >
                {nextMeta.label}
              </span>
              <span className="text-xs text-muted-foreground">로 변경</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
