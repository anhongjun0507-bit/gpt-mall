import { z } from "zod";

import { PRODUCT_CATEGORIES } from "@/lib/product-categories";

// 카테고리 키 합집합 — schema 에서 enum 으로 사용
const categoryKeys = PRODUCT_CATEGORIES.map((c) => c.key) as [
  string,
  ...string[]
];

// 옵션 한 개의 구조 — { name: "기간", values: ["1개월", "3개월"] }
export const productOptionSchema = z.object({
  name: z.string().trim().min(1, "옵션명을 입력하세요"),
  values: z
    .array(z.string().trim().min(1))
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
  image_url: z.string().trim().url().nullable().optional().or(z.literal("").transform(() => null)),
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
