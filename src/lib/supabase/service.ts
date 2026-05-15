import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

// service_role 키로 동작하는 Supabase 클라이언트.
// RLS 를 우회하므로 **반드시 server-side 에서만**, 그리고 호출 코드가
// 사용자 입력 검증·권한 체크·데이터 위조 방지를 스스로 책임지는 흐름에서만 사용한다.
//
// 사용처:
//   - createOrder() — 비회원 주문 흐름. 비회원은 SELECT RLS 를 통과 못 해
//     PostgREST 의 RETURNING(`.select()`) 이 막힘. server-side 가 가격 재검증·
//     재고 확인·user_id 위조 방지를 모두 책임지므로 service_role 로 직접 insert.
//   - /order/complete — 동일 이유. user_id 매칭 검사는 페이지 코드에서 직접 수행.
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase service role env 누락: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createSupabaseClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
