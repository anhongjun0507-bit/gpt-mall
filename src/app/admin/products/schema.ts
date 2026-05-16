import { z } from "zod";

import { PRODUCT_CATEGORIES } from "@/lib/product-categories";

// 카테고리 키 합집합 — schema 에서 enum 으로 사용
const categoryKeys = PRODUCT_CATEGORIES.map((c) => c.key) as [
  string,
  ...string[]
];

// 옵션 한 개의 구조 (0006 마이그레이션 이후).
// { name: "기간", values: [{ label: "1개월", price_modifier: 0 }, ...] }
// price_modifier 는 products.price 에 더하는 금액 (음수 허용).
export const productOptionValueSchema = z.object({
  label: z.string().trim().min(1, "옵션 값을 입력하세요"),
  // UI(OptionBuilder)가 모든 row 를 0으로 초기화하므로 default 불필요.
  // default() 사용 시 react-hook-form Resolver 의 input/output 타입이 분기되어 충돌.
  price_modifier: z.number().int("정수만 가능합니다"),
});

export const productOptionSchema = z.object({
  name: z.string().trim().min(1, "옵션명을 입력하세요"),
  values: z
    .array(productOptionValueSchema)
    .min(1, "최소 1개의 값이 필요합니다"),
});

// 상품 생성/수정 폼 공통 스키마
export const productFormSchema = z.object({
  name: z.string().trim().min(1, "상품명을 입력하세요").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "슬러그를 입력하세요")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "소문자/숫자/하이픈만 사용 가능합니다"),
  category: z.enum(categoryKeys, { message: "카테고리를 선택하세요" }),
  price: z
    .number({ message: "가격을 입력하세요" })
    .int("정수만 가능합니다")
    .min(0, "0원 이상이어야 합니다"),
  original_price: z
    .number()
    .int()
    .min(0)
    .nullable()
    .optional(),
  stock: z
    .number({ message: "재고를 입력하세요" })
    .int()
    .min(0, "0개 이상이어야 합니다"),
  short_description: z.string().trim().max(160).nullable().optional(),
  description: z.string().trim().nullable().optional(),
  // 절대 URL(https://...) 또는 / 로 시작하는 정적 자산 경로(/products/...) 모두 허용.
  // 빈 문자열은 null 로 정규화. 강제 .url() 은 정적 자산을 거부하므로 사용 X.
  image_url: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v),
      "URL 또는 / 로 시작하는 절대 경로여야 합니다"
    )
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  options: z.array(productOptionSchema),
  badge: z.enum(["BEST", "NEW", "HOT"]).nullable().optional(),
  is_active: z.boolean(),
  sort_order: z.number().int(),
})
.refine(
  (data) =>
    data.original_price === null ||
    data.original_price === undefined ||
    data.original_price >= data.price,
  { message: "원가는 판매가 이상이어야 합니다", path: ["original_price"] }
);

export type ProductFormValues = z.infer<typeof productFormSchema>;
