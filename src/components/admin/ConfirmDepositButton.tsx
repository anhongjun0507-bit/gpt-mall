"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { formatKRW } from "@/lib/format";
import { updateOrderStatus } from "@/app/admin/orders/actions";

interface Props {
  orderId: string;
  total: number;
  depositorName: string | null;
}

// 입금 확인 완료 — awaiting_deposit → paid (paid_at 은 서버 액션에서 세팅).
// 되돌리기 어려운 조작이라 확인 다이얼로그를 1회 거친다.
export function ConfirmDepositButton({ orderId, total, depositorName }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      const result = await updateOrderStatus(orderId, "paid");
      if (result.ok) {
        toast({ title: "입금 확인 완료 — 결제 완료로 변경했습니다" });
        setOpen(false);
        router.refresh();
      } else {
        toast({
          title: result.message ?? "변경 실패",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("[ConfirmDepositButton] 실패", e);
      toast({ title: "오류가 발생했어요", variant: "destructive" });
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full bg-accent-gold hover:bg-accent-gold-hover text-footer-bg">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          입금 확인 완료
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>입금을 확인하셨나요?</AlertDialogTitle>
          <AlertDialogDescription>
            {depositorName ? `${depositorName} 님의 ` : ""}
            {formatKRW(total)} 입금이 실제로 통장에 들어온 것을 확인한 뒤
            진행해주세요. 주문 상태가 &apos;결제 완료&apos;로 바뀝니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // 액션 완료 후 직접 닫는다 — 기본 동작으로 먼저 닫히면 실패 토스트가 묻힌다.
              e.preventDefault();
              void handleConfirm();
            }}
            disabled={pending}
          >
            {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            입금 확인 완료
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
