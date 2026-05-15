import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

// 서버 컴포넌트 / 서버 액션 / Route Handler 용 Supabase 클라이언트.
// Next.js 14 의 cookies() 는 동기 — Next 15+ 마이그레이션 시 await 필요.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 서버 컴포넌트에서 set 호출 시 read-only 에러 발생 — 미들웨어가 세션 갱신을
            // 책임지므로 여기서는 무시해도 안전.
          }
        },
      },
    }
  );
}
