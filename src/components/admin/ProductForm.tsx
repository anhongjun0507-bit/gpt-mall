"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { PRODUCT_CATEGORIES } from "@/lib/product-categories";
import { generateSlug } from "@/lib/slug";
import { PriceInput } from "@/components/admin/PriceInput";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { OptionBuilder } from "@/components/admin/OptionBuilder";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/app/admin/products/schema";
import {
  createProduct,
  updateProduct,
  type ActionResult,
} from "@/app/admin/products/actions";

interface Props {
  mode: "create" | "edit";
  // edit 모드에서 사용 — 기존 상품의 id + 초기값
  productId?: string;
  initialValues?: Partial<ProductFormValues>;
}

const DEFAULT_VALUES: ProductFormValues = {
  name: "",
  slug: "",
  category: "ai_assistant",
  price: 0,
  original_price: null,
  stock: 0,
  short_description: null,
  description: null,
  image_url: null,
  options: [],
  badge: null,
  is_active: true,
  sort_order: 0,
};

const BADGES = ["BEST", "NEW", "HOT"] as const;

export function ProductForm({ mode, productId, initialValues }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { ...DEFAULT_VALUES, ...initialValues },
    mode: "onBlur",
  });

  // 슬러그 자동 생성 — 사용자가 슬러그를 한 번이라도 수동 편집하면 자동 갱신 중지.
  const slugTouched = React.useRef(mode === "edit"); // edit 모드는 기본값 존중
  const name = form.watch("name");
  React.useEffect(() => {
    if (slugTouched.current) return;
    if (!name) return;
    form.setValue("slug", generateSlug(name), { shouldValidate: true });
  }, [name, form]);

  async function onSubmit(values: ProductFormValues) {
    setSubmitting(true);
    let result: ActionResult;
    try {
      if (mode === "create") {
        result = await createProduct(values);
      } else if (productId) {
        result = await updateProduct(productId, values);
      } else {
        throw new Error("productId 누락");
      }
    } catch (e) {
      // redirect() 가 던지는 에러는 정상 흐름 — Next.js 가 처리.
      // 실제 에러만 핸들.
      const isRedirect =
        e !== null && typeof e === "object" && "digest" in (e as object);
      if (isRedirect) throw e;
      console.error("[ProductForm] 제출 실패", e);
      toast({ title: "오류가 발생했어요", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    if (!result.ok) {
      // 서버 측 필드 에러 → RHF 필드별 에러로 매핑
      if (result.fieldErrors) {
        for (const [field, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs[0]) {
            form.setError(field as keyof ProductFormValues, {
              type: "server",
              message: msgs[0],
            });
          }
        }
      }
      toast({
        title: result.message ?? "저장 실패",
        variant: "destructive",
      });
      setSubmitting(false);
    }
    // 성공 시는 Server Action 내부 redirect 가 처리 → 별도 처리 불필요
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid lg:grid-cols-3 gap-8"
      >
        {/* 좌측 2/3 — 기본 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 상품명 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상품명</FormLabel>
                <FormControl>
                  <Input placeholder="예: Claude Pro 1개월" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 슬러그 — 자동 생성 + 수동 편집 가능 */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>슬러그</FormLabel>
                <FormControl>
                  <Input
                    placeholder="prod-1234"
                    {...field}
                    onChange={(e) => {
                      slugTouched.current = true;
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  URL 에 사용되는 식별자. 상품명에서 자동 생성되며 수정 가능. 소문자/숫자/하이픈만.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 카테고리 + 배지 — 2열 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((c) => (
                        <SelectItem key={c.key} value={c.key}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="badge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>배지 (선택)</FormLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) =>
                      field.onChange(v === "none" ? null : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">없음</SelectItem>
                      {BADGES.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 가격 + 원가 + 재고 — 3열 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>판매가</FormLabel>
                  <FormControl>
                    <PriceInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="28,000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="original_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>원가 (선택)</FormLabel>
                  <FormControl>
                    <PriceInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="35,000"
                    />
                  </FormControl>
                  <FormDescription>입력 시 할인 표시</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>재고</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                        )
                      }
                      onBlur={field.onBlur}
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 짧은 설명 */}
          <FormField
            control={form.control}
            name="short_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>짧은 설명 (카드용)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="한 줄로 핵심을 요약"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? null : e.target.value)
                    }
                  />
                </FormControl>
                <FormDescription>최대 160자</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 상세 설명 */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상세 설명</FormLabel>
                <FormControl>
                  <Textarea
                    rows={8}
                    placeholder="상품에 대한 자세한 설명. 줄바꿈은 유지됩니다."
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? null : e.target.value)
                    }
                  />
                </FormControl>
                <FormDescription>
                  마크다운은 추후 지원 예정. 지금은 plain text + 줄바꿈.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 옵션 빌더 */}
          <FormField
            control={form.control}
            name="options"
            render={({ field }) => (
              <FormItem>
                <FormLabel>옵션</FormLabel>
                <FormControl>
                  <OptionBuilder
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 우측 1/3 — 이미지 + 활성 + sort_order + submit */}
        <aside className="space-y-6">
          {/* 이미지 */}
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>대표 이미지</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ?? null}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>JPG/PNG/WEBP · 최대 5MB</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 활성 여부 */}
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                <div>
                  <FormLabel className="text-base">활성</FormLabel>
                  <FormDescription>
                    꺼두면 사이트에 노출되지 않습니다.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* sort_order */}
          <FormField
            control={form.control}
            name="sort_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>노출 순서</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                      )
                    }
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormDescription>
                  값이 클수록 먼저 노출. 기본 0.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 액션 */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full"
            >
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === "create" ? "상품 등록" : "변경사항 저장"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.push("/admin/products")}
              disabled={submitting}
            >
              취소
            </Button>
          </div>
        </aside>
      </form>
    </Form>
  );
}
