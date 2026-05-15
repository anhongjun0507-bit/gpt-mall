"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

import { deleteProduct } from "@/app/admin/products/actions";

interface Props {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      const result = await deleteProduct(productId);
      if (result.ok) {
        toast({ title: result.message ?? "삭제 완료" });
        setOpen(false);
        router.refresh();
      } else {
        toast({
          title: result.message ?? "삭제 실패",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("[DeleteProductButton] 실패", e);
      toast({ title: "오류가 발생했어요", variant: "destructive" });
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${productName} 삭제`}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>상품을 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-semibold text-foreground">{productName}</span>
            을 영구 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            <br />
            <br />
            이미 주문 이력에 사용된 상품이라면 삭제할 수 없으니, 그럴 경우 &quot;활성&quot;을 꺼서 노출만 중단하세요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleDelete();
            }}
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
