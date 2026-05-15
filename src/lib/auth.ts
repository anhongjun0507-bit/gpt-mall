import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

// 서버 컴포넌트 / Server Action / Route Handler 전용 인증 헬퍼.
// 클라이언트 측에서는 useUser 훅(추후)을 사용할 것.

// 현재 인증된 사용자 반환. 없으면 null.
export async function getCurrentUser() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (e) {
    console.error("[auth] getCurrentUser 실패", e);
    return null;
  }
}

// 현재 사용자의 profiles 행 반환. 미로그인 시 null.
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw error;
    return (data as Profile) ?? null;
  } catch (e) {
    console.error("[auth] getCurrentProfile 실패", e);
    return null;
  }
}

// 현재 사용자가 admin 인지 boolean 반환.
export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}

// admin 권한이 없으면 즉시 리다이렉트. 페이지 컴포넌트 최상단에서 사용.
// (미들웨어가 이미 가드하지만 페이지 레벨에서도 한 번 더 — defence in depth)
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/");
  }
  return profile;
}

// Header 등에서 한 번에 user+profile 조회용. 미로그인 시 null.
export interface CurrentAuth {
  email: string;
  isAdmin: boolean;
}

export async function getCurrentAuth(): Promise<CurrentAuth | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await getCurrentProfile();
  return {
    email: user.email ?? "",
    isAdmin: profile?.role === "admin",
  };
}
