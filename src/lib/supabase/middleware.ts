import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

// 미들웨어에서 매 요청마다 호출 — Supabase 세션 토큰 자동 갱신 + /admin/* 가드.
export async function updateSession(request: NextRequest) {
  // env 미설정 시 우회 (초기 셋업 단계 대비).
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 토큰 갱신 트리거 (호출 자체가 갱신).
  let user;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (e) {
    console.error("[middleware] supabase session refresh 실패", e);
  }

  // ─── /account/* 로그인 가드 ─────────────────────────────────────────
  // 미로그인이면 /login?next=현재경로 로 redirect. layout 의 requireUser() 가
  // defense in depth 로 한 번 더 검증한다.
  if (request.nextUrl.pathname.startsWith("/account")) {
    if (!user) {
      const url = request.nextUrl.clone();
      const target = request.nextUrl.pathname + request.nextUrl.search;
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("next", target);
      return NextResponse.redirect(url);
    }
  }

  // ─── /admin/* 권한 가드 ────────────────────────────────────────────
  // 운영자 페이지 접근 제어. 페이지 레벨에서도 requireAdmin() 으로 한 번 더 검증.
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("error", "admin_required");
      return NextResponse.redirect(url);
    }

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (profile?.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        url.searchParams.set("error", "admin_required");
        return NextResponse.redirect(url);
      }
    } catch (e) {
      console.error("[middleware] admin 권한 확인 실패", e);
      // 권한 확인 자체가 실패하면 안전하게 차단.
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("error", "admin_check_failed");
      return NextResponse.redirect(url);
    }
  }

  return response;
}
