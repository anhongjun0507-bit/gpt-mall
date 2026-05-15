"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

import {
  profileSchema,
  type ProfileValues,
} from "@/app/(shop)/account/profile/schema";
import { updateProfile } from "@/app/(shop)/account/profile/actions";

interface Props {
  email: string;
  defaultValues: ProfileValues;
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export function ProfileForm({ email, defaultValues }: Props) {
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: "onBlur",
  });

  async function onSubmit(values: ProfileValues) {
    setSubmitting(true);
    try {
      const result = await updateProfile(values);
      if (result.ok) {
        toast({ title: "저장되었습니다" });
        form.reset(values); // dirty 초기화
        return;
      }
      if (result.fieldErrors) {
        for (const [k, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs[0]) {
            form.setError(k as keyof ProfileValues, {
              type: "server",
              message: msgs[0],
            });
          }
        }
      }
      if (result.message) {
        toast({ title: result.message, variant: "destructive" });
      }
    } catch (e) {
      console.error("[ProfileForm] 네트워크/예외", e);
      toast({
        title: "네트워크 오류가 발생했어요",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-lg"
      >
        <div>
          <label className="text-sm font-medium">이메일</label>
          <Input
            value={email}
            readOnly
            disabled
            className="mt-1.5 bg-secondary/40 text-muted-foreground"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            이메일은 변경할 수 없습니다.
          </p>
        </div>

        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름 *</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" disabled={submitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
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
              <FormDescription>주문 알림에 사용됩니다.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={submitting || !form.formState.isDirty}
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? "저장 중..." : "변경사항 저장"}
        </Button>
      </form>
    </Form>
  );
}
