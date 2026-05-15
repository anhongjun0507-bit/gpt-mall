import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata = { title: "주문서 작성" };

// /checkout — 비회원도 진입 가능.
// 카트가 비어있으면 CheckoutForm 측 useEffect 에서 /cart 로 redirect.
export default function CheckoutPage() {
  return (
    <Container className="py-12 md:py-16">
      <Heading variant="h2" className="!text-2xl">
        주문서 작성
      </Heading>
      <p className="mt-2 text-muted-foreground">
        주문 정보를 입력하고 결제를 진행해주세요.
      </p>

      <div className="mt-10">
        <CheckoutForm />
      </div>
    </Container>
  );
}
