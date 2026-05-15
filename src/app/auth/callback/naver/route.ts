import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/service";
import { STATE_COOKIE, NEXT_COOKIE } from "@/app/auth/naver/start/route";

// 네이버 OAuth 콜백.
//   1. cookie state ↔ query state 검증 (CSRF)
//   2. code → access_token (nid.naver.com/oauth2.0/token)
//   3. access_token → user 정보 (openapi.naver.com/v1/nid/me)
//   4. admin.createUser 시도 → 신규 또는 기존(email_exists) 분기
//   5. admin.generateLink(magiclink, redirectTo: /auth/callback?next=...)
//   6. action_link 로 302 → Supabase 가 우리 사이트에 세션 cookie 발급
//
// 중복 가입 정책:
// - 신규: user_metadata.provider = 'naver', providers = ['naver']
// - 기존: providers 배열에 'naver' 누적 추가 (이미 있으면 스킵). provider(단수)는 첫 가입값 유지.
//
// 모든 차단/실패 경로는 /login?error=naver_xxx 로 통일.

export const dynamic = "force-dynamic";

function buildErrorRedirect(request: NextRequest, errorKey: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("error", errorKey);
  return NextResponse.redirect(url);
}

function clearOauthCookies() {
  const cookieStore = cookies();
  const isProd = process.env.NODE_ENV === "production";
  const baseDel = {
    path: "/",
    ...(isProd ? { domain: ".digitalst.kr" } : {}),
  };
  cookieStore.set(STATE_COOKIE, "", { ...baseDel, maxAge: 0 });
  cookieStore.set(NEXT_COOKIE, "", { ...baseDel, maxAge: 0 });
}

function safeNextPath(raw: string | undefined): string {
  if (!raw) return "/";
  if (!raw.startsWith("/")) return "/";
  if (raw.startsWith("//")) return "/";
  if (raw.startsWith("/\\")) return "/";
  return raw;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const code = sp.get("code");
  const state = sp.get("state");
  const oauthError = sp.get("error");

  const cookieStore = cookies();
  const storedState = cookieStore.get(STATE_COOKIE)?.value;
  const storedNext = safeNextPath(cookieStore.get(NEXT_COOKIE)?.value);

  // 사용자 거부 등 네이버 측 에러
  if (oauthError) {
    clearOauthCookies();
    const key =
      oauthError === "access_denied" ? "naver_access_denied" : "naver_failed";
    return buildErrorRedirect(request, key);
  }

  // CSRF 검증
  if (!code || !state || !storedState || state !== storedState) {
    clearOauthCookies();
    return buildErrorRedirect(request, "naver_state_mismatch");
  }

  // 키 미설정 가드 (예외적이지만 환경 누락 시)
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    clearOauthCookies();
    return buildErrorRedirect(request, "naver_unavailable");
  }

  try {
    // 1) code → access_token
    const tokenUrl = new URL("https://nid.naver.com/oauth2.0/token");
    tokenUrl.searchParams.set("grant_type", "authorization_code");
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("code", code);
    tokenUrl.searchParams.set("state", state);

    const tokenRes = await fetch(tokenUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });
    if (!tokenRes.ok) {
      throw new Error(`token endpoint ${tokenRes.status}`);
    }
    const tokenJson = await tokenRes.json();
    const accessToken: string | undefined = tokenJson.access_token;
    if (!accessToken) {
      throw new Error("no access_token in response");
    }

    // 2) access_token → 사용자 정보
    const meRes = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!meRes.ok) throw new Error(`me endpoint ${meRes.status}`);
    const meJson = await meRes.json();
    if (meJson.resultcode !== "00") {
      throw new Error(`me resultcode ${meJson.resultcode}: ${meJson.message}`);
    }

    const profile = meJson.response ?? {};
    const email = typeof profile.email === "string" ? profile.email : null;
    const naverId = typeof profile.id === "string" ? profile.id : null;
    const name = typeof profile.name === "string" ? profile.name : null;
    const nickname =
      typeof profile.nickname === "string" ? profile.nickname : null;
    const displayName = name || nickname || null;

    if (!email || !naverId) {
      clearOauthCookies();
      return buildErrorRedirect(request, "naver_email_required");
    }

    // 3) Supabase user 처리 — admin.createUser 시도 → 기존(email_exists) 분기
    const admin = createServiceRoleClient();

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        provider: "naver",
        providers: ["naver"],
        naver_id: naverId,
        display_name: displayName,
        name,
        nickname,
      },
    });

    if (createErr) {
      const msg = createErr.message ?? "";
      const isExisting =
        /already.*registered|already.*exists|email[_ ]exists|duplicate/i.test(
          msg
        ) || (createErr as { code?: string }).code === "email_exists";

      if (!isExisting) {
        throw createErr;
      }

      // 기존 사용자 — providers 배열에 'naver' 누적
      // listUsers 로 email 매칭 (Supabase 가 server-side email 검색 API 미제공이라 페이지 iterate)
      let foundUserId: string | null = null;
      let foundMeta: Record<string, unknown> | null = null;
      let page = 1;
      const perPage = 200;
      // 안전 한도 (5,000 명까지 검색). 그 이상이면 RPC 로 최적화 필요 — TODO.
      for (let i = 0; i < 25 && !foundUserId; i++, page++) {
        const { data: listData, error: listErr } =
          await admin.auth.admin.listUsers({ page, perPage });
        if (listErr) throw listErr;
        const hit = listData.users.find((u) => u.email === email);
        if (hit) {
          foundUserId = hit.id;
          foundMeta = (hit.user_metadata as Record<string, unknown>) ?? {};
          break;
        }
        if (listData.users.length < perPage) break; // 마지막 페이지
      }
      if (!foundUserId) {
        throw new Error(`existing email but user not found in listUsers: ${email}`);
      }

      const existingProviders = Array.isArray(foundMeta?.providers)
        ? (foundMeta!.providers as string[])
        : foundMeta?.provider
          ? [foundMeta.provider as string]
          : [];
      const mergedProviders = existingProviders.includes("naver")
        ? existingProviders
        : [...existingProviders, "naver"];

      const { error: updErr } = await admin.auth.admin.updateUserById(
        foundUserId,
        {
          user_metadata: {
            ...foundMeta,
            providers: mergedProviders,
            // provider(단수) 는 첫 가입값 유지 — foundMeta.provider 덮어쓰지 않음
            naver_id: naverId,
            name: foundMeta?.name ?? name,
            nickname: foundMeta?.nickname ?? nickname,
            display_name: foundMeta?.display_name ?? displayName,
          },
        }
      );
      if (updErr) throw updErr;
    } else if (!created?.user) {
      throw new Error("createUser returned no user");
    }

    // 4) Magic Link 생성 → action_link 로 redirect
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(
      storedNext
    )}`;

    const { data: linkData, error: linkErr } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo },
      });
    if (linkErr) throw linkErr;
    const actionLink = linkData?.properties?.action_link;
    if (!actionLink) {
      throw new Error("generateLink returned no action_link");
    }

    clearOauthCookies();
    return NextResponse.redirect(actionLink);
  } catch (e) {
    console.error("[naver/callback] 실패", e);
    clearOauthCookies();
    return buildErrorRedirect(request, "naver_failed");
  }
}
