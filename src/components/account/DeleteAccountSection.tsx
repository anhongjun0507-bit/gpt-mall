"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { clearCart } from "@/lib/cart";
import { deleteAccount } from "@/app/(shop)/account/profile/actions";

// 오타·자동완성으로는 통과할 수 없도록 정확히 이 문구를 입력해야 버튼이 열린다.
const CONFIRM_PHRASE = "탈퇴합니다";

export function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [phrase, setPhrase] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const canSubmit = phrase.trim() === CONFIRM_PHRASE && !submitting;

  async function handleDelete() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await deleteAccount();
      if (!result.ok) {
        toast({
          title: result.message ?? "탈퇴 처리에 실패했어요",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // 로그아웃 흐름과 동일하게 localStorage 장바구니도 비운다.
      try {
        clearCart();
      } catch (e) {
        console.error("[DeleteAccountSection] clearCart 실패", e);
      }

      toast({
        title: "탈퇴가 완료되었습니다",
        description: "그동안 이용해주셔서 감사합니다.",
      });
      router.replace("/");
      router.refresh();
    } catch (e) {
      console.error("[DeleteAccountSection] 네트워크/예외", e);
      toast({ title: "네트워크 오류가 발생했어요", variant: "destructive" });
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg">
      <Separator className="my-10" />

      <h3 className="text-sm font-semibold text-muted-foreground">회원 탈퇴</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        계정 정보는 삭제되며, 주문·결제 기록은 관련 법령에 따라 일정 기간 보관 후
        파기됩니다.
      </p>

      {!open ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 text-muted-foreground hover:text-destructive hover:border-destructive/40"
          onClick={() => setOpen(true)}
        >
          회원 탈퇴
        </Button>
      ) : (
        <div className="mt-4 rounded-xl border border-border bg-secondary/20 p-4">
          <label
            htmlFor="delete-confirm"
            className="text-sm text-muted-foreground"
          >
            계속하려면 <strong className="text-foreground">{CONFIRM_PHRASE}</strong>{" "}
            를 입력해주세요.
          </label>
          <Input
            id="delete-confirm"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            autoComplete="off"
            disabled={submitting}
            className="mt-2 bg-background"
          />
          <div className="mt-4 flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={!canSubmit}
              onClick={handleDelete}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? "처리 중..." : "탈퇴하기"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={submitting}
              onClick={() => {
                setOpen(false);
                setPhrase("");
              }}
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
