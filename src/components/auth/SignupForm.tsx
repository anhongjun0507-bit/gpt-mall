"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { PasswordInput } from "@/components/auth/PasswordInput";
import { signupSchema, type SignupValues } from "@/app/(auth)/schemas";
import { signUpWithEmail } from "@/app/(auth)/actions";

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      agreeTerms: false as true,
      agreePrivacy: false as true,
    },
    mode: "onBlur",
  });

  async function onSubmit(values: SignupValues) {
    setServerError(null);
    setSubmitting(true);

    let result;
    try {
      result = await signUpWithEmail(values);
    } catch (e) {
      console.error("[SignupForm] 네트워크 또는 예외", e);
      setServerError("네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    if (result.ok && result.redirect) {
      router.push(result.redirect);
      router.refresh();
      return;
    }

    if (result.fieldErrors) {
      for (const [k, msgs] of Object.entries(result.fieldErrors)) {
        if (msgs[0]) {
          form.setError(k as keyof SignupValues, {
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
              <FormLabel>비밀번호</FormLabel>
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
              <FormLabel>비밀번호 확인</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="다시 한 번 입력"
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3 pt-2">
          <FormField
            control={form.control}
            name="agreeTerms"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={submitting}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal cursor-pointer">
                  <span className="text-accent-gold font-semibold">[필수]</span>{" "}
                  <a
                    href="#"
                    className="underline hover:text-accent-gold transition-gold"
                  >
                    이용약관
                  </a>
                  에 동의합니다
                </FormLabel>
              </FormItem>
            )}
          />
          {form.formState.errors.agreeTerms && (
            <p className="text-xs text-destructive">
              {form.formState.errors.agreeTerms.message}
            </p>
          )}

          <FormField
            control={form.control}
            name="agreePrivacy"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={submitting}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal cursor-pointer">
                  <span className="text-accent-gold font-semibold">[필수]</span>{" "}
                  <a
                    href="#"
                    className="underline hover:text-accent-gold transition-gold"
                  >
                    개인정보처리방침
                  </a>
                  에 동의합니다
                </FormLabel>
              </FormItem>
            )}
          />
          {form.formState.errors.agreePrivacy && (
            <p className="text-xs text-destructive">
              {form.formState.errors.agreePrivacy.message}
            </p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full h-12" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? "처리 중..." : "회원가입"}
        </Button>
      </form>
    </Form>
  );
}
