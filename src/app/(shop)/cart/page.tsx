import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { CartContent } from "@/components/cart/CartContent";

export const metadata = { title: "장바구니" };

// /cart — 서버 셸 (메타데이터/헤더) + 클라이언트 CartContent (localStorage 의존).
// useCart 가 SSR 시엔 빈 배열 반환 → 빈 상태 깜빡임 가능. CartContent 가 마운트 후 실제 데이터로 갱신.
export default function CartPage() {
  return (
    <Container className="py-12 md:py-16">
      <Heading variant="h2" className="!text-2xl">
        장바구니
      </Heading>
      <CartContent />
    </Container>
  );
}
