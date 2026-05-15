"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/app/(auth)/schemas";
import { requestPasswordReset } from "@/app/(auth)/actions";

export function ForgotPasswordForm() {
  const [sent, setSent] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setServerError(null);
    setSubmitting(true);
    const result = await requestPasswordReset(values);
    setSubmitting(false);
    if (result.ok) {
      setSent(true);
    } else {
      if (result.fieldErrors) {
        for (const [k, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs[0]) {
            form.setError(k as keyof ForgotPasswordValues, {
              type: "server",
              message: msgs[0],
            });
          }
        }
      }
      if (result.message) setServerError(result.message);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-accent-gold/10 flex items-center justify-center">
          <MailCheck className="w-6 h-6 text-accent-gold" />
        </div>
        <p className="mt-6 font-semibold">이메일을 확인해주세요</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          입력하신 이메일로 비밀번호 재설정 링크를 보냈어요.
          <br />
          메일이 안 보이면 스팸함도 확인해주세요.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>가입하신 이메일</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full h-12" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? "전송 중..." : "재설정 링크 보내기"}
        </Button>
      </form>
    </Form>
  );
}
