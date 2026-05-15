import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";

import { STATE_COOKIE, NEXT_COOKIE } from "@/lib/naver-oauth";

// 네이버 OAuth 시작 라우트.
// state(CSRF 방어) + next(로그인 후 복귀 경로) 를 HttpOnly cookie 에 심고
// nid.naver.com/oauth2.0/authorize 로 302 redirect.
//
// production 에선 apex(`digitalst.kr`) → www 307 redirect 흐름에서도 cookie 가
// 유지되도록 domain=.digitalst.kr 로 subdomain 공유.

export const dynamic = "force-dynamic";

const COOKIE_TTL = 60 * 5; // 5분

// open redirect 방어 — / 로 시작하는 단일 슬래시 경로만 허용.
function safeNextPath(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/")) return "/";
  if (raw.startsWith("//")) return "/";
  if (raw.startsWith("/\\")) return "/";
  return raw;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  // 키 미설정(클라이언트가 키 전달 전) — 안전 차단
  if (!clientId) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("error", "naver_unavailable");
    return NextResponse.redirect(url);
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectUri = `${siteUrl}/auth/callback/naver`;

  const state = randomBytes(16).toString("hex");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));

  const isProd = process.env.NODE_ENV === "production";
  const baseOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_TTL,
    // apex/www 모두에서 읽도록 production 만 domain 명시. dev/localhost 는 default(host-only).
    ...(isProd ? { domain: ".digitalst.kr" } : {}),
  };

  const cookieStore = cookies();
  cookieStore.set(STATE_COOKIE, state, baseOpts);
  cookieStore.set(NEXT_COOKIE, next, baseOpts);

  const authUrl = new URL("https://nid.naver.com/oauth2.0/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
