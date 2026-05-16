import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { Footer } from "@/components/layout/Footer";

// Root 404 — 어떤 라우트 그룹에도 매칭되지 않은 경로(예: /random-xxx)에서 적용.
// (shop) 그룹의 not-found.tsx 는 (shop) 내부에서 notFound() 호출 시 적용.
// Header/Footer 가 자동으로 입혀지지 않으므로 직접 렌더.

export const metadata = { title: "페이지를 찾을 수 없습니다" };

export default function NotFound() {
  return (
    <>
      <HeaderWrapper />
      <main className="min-h-[60vh]">
        <Container className="py-20 md:py-32">
          <div className="mx-auto max-w-md text-center">
            <p className="text-7xl md:text-8xl font-extrabold text-accent-gold tabular-nums tracking-tighter">
              404
            </p>
            <Heading variant="h2" className="mt-8 !text-2xl md:!text-3xl">
              찾으시는 페이지가 없어요
            </Heading>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              주소가 잘못 입력됐거나 페이지가 이동·삭제되었어요.
              <br />
              아래 버튼으로 다시 둘러봐주세요.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:justify-center">
              <Button asChild className="sm:w-44">
                <Link href="/">홈으로 돌아가기</Link>
              </Button>
              <Button asChild variant="outline" className="sm:w-44">
                <Link href="/products">상품 둘러보기</Link>
              </Button>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
