"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { PasswordInput } from "@/components/auth/PasswordInput";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/app/(auth)/schemas";
import { updatePassword } from "@/app/(auth)/actions";

export function ResetPasswordForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", passwordConfirm: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: ResetPasswordValues) {
    setServerError(null);
    setSubmitting(true);

    let result;
    try {
      result = await updatePassword(values);
    } catch (e) {
      console.error("[ResetPasswordForm] 네트워크 또는 예외", e);
      setServerError("네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    if (result.ok && result.redirect) {
      toast({ title: "비밀번호가 변경되었습니다" });
      router.push(result.redirect);
      router.refresh();
      return;
    }

    if (result.fieldErrors) {
      for (const [k, msgs] of Object.entries(result.fieldErrors)) {
        if (msgs[0]) {
          form.setError(k as keyof ResetPasswordValues, {
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>새 비밀번호</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="최소 8자"
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
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>새 비밀번호 확인</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
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
          {submitting ? "변경 중..." : "비밀번호 변경"}
        </Button>
      </form>
    </Form>
  );
}
