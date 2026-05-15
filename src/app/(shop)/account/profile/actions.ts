"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

import { profileSchema, type ProfileValues } from "./schema";

export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateProfile(
  values: ProfileValues
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다" };

  try {
    const supabase = createClient();
    // role 은 명시적으로 update 하지 않는다. RLS profiles_update_self 도
    // 본인 row 만 허용하며, prevent_role_self_change 트리거가 추가 방어.
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: parsed.data.display_name.trim(),
        phone: parsed.data.phone,
      })
      .eq("id", user.id);
    if (error) throw error;

    revalidatePath("/account");
    revalidatePath("/account/profile");

    return { ok: true };
  } catch (e) {
    console.error("[account/profile] 업데이트 실패", e);
    return {
      ok: false,
      message: "저장에 실패했어요. 잠시 후 다시 시도해주세요.",
    };
  }
}
