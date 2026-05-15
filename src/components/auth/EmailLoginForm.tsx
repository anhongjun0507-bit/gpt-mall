"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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

import { PasswordInput } from "@/components/auth/PasswordInput";
import { loginSchema, type LoginValues } from "@/app/(auth)/schemas";
import { signInWithEmail } from "@/app/(auth)/actions";

interface Props {
  next?: string;
}

export function EmailLoginForm({ next }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    setSubmitting(true);

    let result;
    try {
      result = await signInWithEmail(values, next);
    } catch (e) {
      console.error("[EmailLoginForm] 네트워크 또는 예외", e);
      setServerError("네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    if (result.ok && result.redirect) {
      // refresh() 로 Header 등 Server Component 의 user 상태 즉시 갱신
      router.push(result.redirect);
      router.refresh();
      return;
    }

    // 실패 처리
    if (result.fieldErrors) {
      for (const [k, msgs] of Object.entries(result.fieldErrors)) {
        if (msgs[0]) {
          form.setError(k as keyof LoginValues, {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>비밀번호</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-accent-gold transition-gold"
                >
                  비밀번호 찾기
                </Link>
              </div>
              <FormControl>
                <PasswordInput
                  autoComplete="current-password"
                  placeholder="••••••••"
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
          {submitting ? "처리 중..." : "로그인"}
        </Button>
      </form>
    </Form>
  );
}
