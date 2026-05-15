import { getCurrentAuth } from "@/lib/auth";

import { Header } from "./Header";

// Server Component — 서버에서 한 번 user/profile 조회 후 Client Header 에 prop 전달.
// (shop)/layout 과 (auth)/layout 둘 다 이 컴포넌트를 사용해 중복 제거.
export async function HeaderWrapper() {
  const auth = await getCurrentAuth();
  return <Header auth={auth} />;
}
