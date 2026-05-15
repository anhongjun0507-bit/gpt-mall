"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { productFormSchema, type ProductFormValues } from "./schema";

// 결과 타입 — 폼이 필드별 에러 표시할 수 있도록 fieldErrors 분리.
export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

// 신규 상품 생성. 성공 시 /admin/products 로 redirect.
export async function createProduct(values: ProductFormValues): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "입력값을 확인해주세요",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .insert({
        name: parsed.data.name,
        slug: parsed.data.slug,
        category: parsed.data.category as never, // 카테고리 enum 으로 좁힘
        price: parsed.data.price,
        original_price: parsed.data.original_price ?? null,
        stock: parsed.data.stock,
        short_description: parsed.data.short_description ?? null,
        description: parsed.data.description ?? null,
        image_url: parsed.data.image_url ?? null,
        options: parsed.data.options,
        badge: parsed.data.badge ?? null,
        is_active: parsed.data.is_active,
        sort_order: parsed.data.sort_order,
      });
    if (error) {
      // slug 중복 — Postgres unique_violation
      if (error.code === "23505") {
        return {
          ok: false,
          message: "이미 사용 중인 슬러그입니다",
          fieldErrors: { slug: ["이미 사용 중인 슬러그입니다"] },
        };
      }
      throw error;
    }
  } catch (e) {
    console.error("[createProduct] 실패", e);
    return { ok: false, message: "상품 등록에 실패했습니다" };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products?created=1");
}

// 기존 상품 수정. 성공 시 /admin/products 로 redirect.
export async function updateProduct(
  id: string,
  values: ProductFormValues
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "입력값을 확인해주세요",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({
        name: parsed.data.name,
        slug: parsed.data.slug,
        category: parsed.data.category as never,
        price: parsed.data.price,
        original_price: parsed.data.original_price ?? null,
        stock: parsed.data.stock,
        short_description: parsed.data.short_description ?? null,
        description: parsed.data.description ?? null,
        image_url: parsed.data.image_url ?? null,
        options: parsed.data.options,
        badge: parsed.data.badge ?? null,
        is_active: parsed.data.is_active,
        sort_order: parsed.data.sort_order,
      })
      .eq("id", id);
    if (error) {
      if (error.code === "23505") {
        return {
          ok: false,
          message: "이미 사용 중인 슬러그입니다",
          fieldErrors: { slug: ["이미 사용 중인 슬러그입니다"] },
        };
      }
      throw error;
    }
  } catch (e) {
    console.error("[updateProduct] 실패", e);
    return { ok: false, message: "상품 수정에 실패했습니다" };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  redirect("/admin/products?updated=1");
}

// 상품 삭제. order_items 에서 referencing 시 FK restrict 로 막힘 → 안내.
export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      // FK violation — 이미 주문 이력에 사용된 상품
      if (error.code === "23503") {
        return {
          ok: false,
          message: "이미 주문 이력이 있는 상품은 삭제할 수 없습니다. 비활성으로 전환해주세요.",
        };
      }
      throw error;
    }
  } catch (e) {
    console.error("[deleteProduct] 실패", e);
    return { ok: false, message: "상품 삭제에 실패했습니다" };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true, message: "상품을 삭제했습니다" };
}
