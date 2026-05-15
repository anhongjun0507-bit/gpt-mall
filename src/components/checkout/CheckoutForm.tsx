"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { cn } from "@/lib/utils";
import { formatKRW } from "@/lib/format";
import { useCart } from "@/hooks/useCart";

import { checkoutSchema, type CheckoutValues } from "@/app/(shop)/checkout/schema";
import { createOrder } from "@/app/(shop)/checkout/actions";

// 010-XXXX-XXXX 자동 포맷
function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

const PAYMENT_METHODS = [
  { value: "kakaopay", label: "카카오페이", emoji: "💛" },
  { value: "naverpay", label: "네이버페이", emoji: "💚" },
  { value: "card", label: "신용카드", emoji: "💳" },
] as const;

export function CheckoutForm() {
  const router = useRouter();
  const { items, count, total } = useCart();
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  // 카트 비었으면 /cart 로 — 마운트 후 빈 카트 확인되면 즉시 이동.
  // SSR 시점엔 items.length === 0 이지만 마운트 후 localStorage 에서 hydrate.
  // hydrate 완료를 기다리기 위해 짧은 지연을 두지 않고, items 변화에 반응.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  // 카트가 빈 채로 /checkout 에 들어온 경우만 /cart 로 돌려보낸다.
  // submitting 중에는 절대 redirect 하지 않는다 — 결제 직후 카트가 비워지면서
  // 이 effect 가 깨어나 /order/complete 로 가는 navigation 을 가로채는 race 방지.
  React.useEffect(() => {
    if (mounted && !submitting && items.length === 0) {
      router.replace("/cart");
    }
  }, [mounted, submitting, items.length, router]);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      recipient_name: "",
      recipient_phone: "",
      kakao_id: "",
      memo: "",
      payment_method: "kakaopay",
      agree_terms: false as true,
      agree_privacy: false as true,
    },
    mode: "onBlur",
  });

  const agreeTerms = form.watch("agree_terms");
  const agreePrivacy = form.watch("agree_privacy");
  const allAgreed = Boolean(agreeTerms) && Boolean(agreePrivacy);
  function toggleAll(checked: boolean) {
    form.setValue("agree_terms", checked as true, { shouldValidate: true });
    form.setValue("agree_privacy", checked as true, { shouldValidate: true });
  }

  async function onSubmit(values: CheckoutValues) {
    setServerError(null);
    setSubmitting(true);

    let result;
    try {
      result = await createOrder(values, items);
    } catch (e) {
      console.error("[CheckoutForm] 네트워크/예외", e);
      setServerError("네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    if (result.ok && result.redirect) {
      // ─── PG 결제 모듈 호출 자리 ───────────────────────────
      // 가맹 후: 여기서 PG SDK 결제창 띄우고 결과 콜백에서 markOrderPaid 호출.
      // 현재는 곧장 완료 페이지로.
      // ─────────────────────────────────────────────────────
      // clearCart() 는 /order/complete 의 CartClearer 가 담당.
      // 여기서 호출하면 cart 변경 이벤트가 위 useEffect 를 깨워서 /cart 로
      // 가는 navigation 이 /order/complete 로 가는 navigation 을 가로챈다.
      router.push(result.redirect);
      router.refresh();
      return;
    }

    if (result.fieldErrors) {
      for (const [k, msgs] of Object.entries(result.fieldErrors)) {
        if (msgs[0]) {
          form.setError(k as keyof CheckoutValues, {
            type: "server",
            message: msgs[0],
          });
        }
      }
    }
    if (result.message) setServerError(result.message);
    setSubmitting(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid lg:grid-cols-3 gap-8"
      >
        {/* ─── 좌측 lg:col-span-2 ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. 주문 상품 (읽기 전용) */}
          <Card title="주문 상품" description={`${count}개`}>
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li
                  key={`${item.productId}|${JSON.stringify(item.selectedOptions)}`}
                  className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="w-14 h-14 rounded-lg bg-secondary overflow-hidden shrink-0">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.name}</p>
                    {Object.keys(item.selectedOptions).length > 0 && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {Object.entries(item.selectedOptions)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatKRW(item.price)} × {item.qty}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums shrink-0">
                    {formatKRW(item.price * item.qty)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          {/* 2. 주문자 정보 */}
          <Card title="주문자 정보">
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="recipient_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="홍길동"
                        disabled={submitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recipient_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>휴대전화 *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="010-1234-5678"
                        disabled={submitting}
                        {...field}
                        onChange={(e) => field.onChange(formatPhone(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      📱 라이센스는 입력하신 번호로 SMS 발송됩니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* 3. 디지털 상품 수령 정보 */}
          <Card title="디지털 상품 수령 정보">
            <div className="rounded-md bg-secondary/50 border border-border/40 px-4 py-3 mb-5 text-sm text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-accent-gold" />
              <p>📱 결제 완료 후 입력하신 휴대전화 번호로 라이센스가 SMS 발송됩니다.</p>
            </div>
            <FormField
              control={form.control}
              name="kakao_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카카오톡 ID (선택)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="카톡으로도 받고 싶으시면 입력"
                      disabled={submitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    카톡 채널에서 별도로 한 번 더 보내드려요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* 4. 요청사항 */}
          <Card title="요청사항 (선택)">
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="배송 시 요청사항이나 문의 내용을 입력해주세요."
                      disabled={submitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* 5. 결제 수단 */}
          <Card title="결제 수단">
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {PAYMENT_METHODS.map((m) => {
                        const isActive = field.value === m.value;
                        return (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => field.onChange(m.value)}
                            disabled={submitting}
                            className={cn(
                              "h-16 rounded-md border flex items-center justify-center gap-2 transition-all duration-200 text-sm font-medium",
                              isActive
                                ? "bg-accent-gold/10 border-accent-gold text-accent-gold"
                                : "bg-background border-border text-foreground hover:border-foreground/40"
                            )}
                          >
                            <span aria-hidden>{m.emoji}</span>
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="mt-4 text-xs text-muted-foreground bg-secondary/40 border border-border/40 rounded-md px-3 py-2 leading-relaxed">
              ⚠️ 결제 시스템이 현재 가맹 승인 대기 중입니다. 주문은 정상 접수되며,
              가맹 승인 완료 후 별도로 결제 안내를 드립니다.
            </p>
          </Card>

          {/* 6. 약관 동의 */}
          <Card title="약관 동의">
            <div className="space-y-3">
              {/* 전체 동의 */}
              <label className="flex items-center gap-3 pb-3 border-b border-border cursor-pointer">
                <Checkbox
                  checked={allAgreed}
                  onCheckedChange={(c) => toggleAll(Boolean(c))}
                  disabled={submitting}
                />
                <span className="font-semibold">전체 동의</span>
              </label>

              <FormField
                control={form.control}
                name="agree_terms"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer flex items-center gap-2 text-sm">
                      <span className="text-accent-gold font-semibold">[필수]</span>
                      <span>구매조건 확인 및 결제 진행 동의</span>
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-accent-gold underline text-xs transition-gold"
                      >
                        보기
                      </a>
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.formState.errors.agree_terms && (
                <p className="text-xs text-destructive pl-8">
                  {form.formState.errors.agree_terms.message}
                </p>
              )}

              <FormField
                control={form.control}
                name="agree_privacy"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer flex items-center gap-2 text-sm">
                      <span className="text-accent-gold font-semibold">[필수]</span>
                      <span>개인정보 제3자 제공 동의 (PG사 — 가맹 후 활성화)</span>
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-accent-gold underline text-xs transition-gold"
                      >
                        보기
                      </a>
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.formState.errors.agree_privacy && (
                <p className="text-xs text-destructive pl-8">
                  {form.formState.errors.agree_privacy.message}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* ─── 우측 lg:col-span-1: 주문 요약 ─── */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl bg-card border border-border/60 p-6">
              <h2 className="text-h4 font-semibold">주문 요약</h2>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    상품 금액 <span className="tabular-nums">({count}개)</span>
                  </dt>
                  <dd className="tabular-nums">{formatKRW(total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">할인</dt>
                  <dd className="text-muted-foreground">-</dd>
                </div>
              </dl>

              <div className="my-5 h-px bg-border" />

              <div className="flex items-baseline justify-between">
                <span className="font-semibold">총 결제금액</span>
                <span className="text-2xl font-bold text-accent-gold tabular-nums">
                  {formatKRW(total)}
                </span>
              </div>

              {serverError && (
                <p className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                  {serverError}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full h-12 mt-5 bg-accent-gold hover:bg-accent-gold-hover text-footer-bg"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? "주문 생성 중..." : "결제하기"}
              </Button>

              <p className="mt-3 text-xs text-muted-foreground text-center leading-relaxed">
                현재 결제 모듈 준비 중 — 주문은 &apos;결제 대기&apos; 상태로
                <br />
                저장됩니다.
              </p>
            </div>

            {/* 안내 */}
            <div className="rounded-2xl bg-secondary/40 border border-border/40 p-5 space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p className="flex items-start gap-2">
                <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent-gold" />
                결제 정보는 PG 사의 보안 시스템을 통해 안전하게 처리됩니다.
              </p>
              <p className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent-gold" />
                디지털 상품은 라이센스 발급 전까지만 환불 가능합니다.{" "}
                <Link href="/help/refund" className="underline hover:text-foreground">
                  자세히
                </Link>
              </p>
            </div>
          </div>
        </aside>
      </form>
    </Form>
  );
}

// 단순 카드 래퍼 — 제목 + 설명 + 본문.
function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card border border-border/60 p-6">
      <header className="flex items-baseline justify-between mb-5">
        <h2 className="text-h4 font-semibold">{title}</h2>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </header>
      {children}
    </section>
  );
}
