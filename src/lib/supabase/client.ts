import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

// 클라이언트 컴포넌트(브라우저)용 Supabase 클라이언트.
// 익명/로그인 사용자 모두 이 클라이언트로 데이터 접근 — RLS가 권한 통제.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
