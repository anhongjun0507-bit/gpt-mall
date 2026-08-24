import Link from "next/link";
import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { JsonLd } from "@/components/seo/JsonLd";

// 자주 묻는 질문 — 답변 원문은 아래 FAQ_ITEMS 단일 소스에서 화면과 JSON-LD 가
// 같은 문자열을 쓴다(구조화 데이터와 화면 텍스트 불일치 방지).
// 환불 답변은 이용약관 제14조 2항 원문을 그대로 옮긴 것이며 임의 수정 금지.

export const metadata: Metadata = {
  title: "자주 묻는 질문",
  description:
    "디지털스토어 이용 전 자주 묻는 질문을 모았습니다. 구독 공유 방식과 발급 소요 시간, 가족 그룹 초대 조건, 계정 이용 시 주의사항, 환불 기준과 문의 방법을 안내드립니다.",
  alternates: { canonical: "/faq" },
};

const KAKAO_CHANNEL_URL = "https://pf.kakao.com/_xhHWgn";
const KAKAO_CHANNEL_TEXT = "pf.kakao.com/_xhHWgn";

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "구독 공유는 어떤 방식으로 이용하나요?",
    a: "상품에 따라 제공 방식이 다릅니다. 유튜브 프리미엄은 가족 그룹 초대 방식으로 제공되며, 그 외 상품은 개별 이용 계정 또는 이용권 활성화 방식으로 제공됩니다. 구체적인 제공 방식은 주문 확인 후 안내드립니다.",
  },
  {
    q: "주문 후 발급까지 얼마나 걸리나요?",
    a: "입금 확인 후 순차적으로 발급해드리며, 상품 및 공급 일정에 따라 최대 24시간 이내에 발급됩니다. 대부분 그보다 빠르게 처리되며, 지연이 예상되는 경우 카카오톡으로 개별 안내드립니다. 문의는 24시간 접수 가능합니다.",
  },
  {
    q: "이미 다른 가족 그룹에 속해 있는데 이용할 수 있나요?",
    a: "가족 그룹 초대 방식으로 제공되는 상품(유튜브 프리미엄)에 해당하는 내용입니다. 최근 12개월 안에 가족 그룹을 변경하신 이력이 있으면 초대가 제한될 수 있으니, 주문하시기 전에 현재 소속된 그룹과 변경 이력을 먼저 확인해 보시기를 권해 드립니다.",
  },
  {
    q: "계정의 국가 설정이 다른데 괜찮은가요?",
    a: "가족 그룹 초대 방식은 구성원의 국가 설정이 서로 일치해야 초대가 가능한 경우가 있습니다. 국가 설정이 다르면 초대가 거절될 수 있으니 주문 전에 확인해 주시기 바랍니다.",
  },
  {
    q: "받은 계정의 비밀번호를 변경해도 되나요?",
    a: "개별 이용 계정으로 제공되는 경우에는 계정을 받으신 뒤 비밀번호를 직접 변경하고 OTP(일회용 비밀번호)를 설정해 두시기를 권해 드립니다. 가족 그룹 초대 방식으로 제공되는 상품은 회원님이 쓰시던 계정을 그대로 사용하시므로 이 안내는 해당하지 않습니다.",
  },
  {
    q: "계정에 등록된 이메일 주소를 바꿔도 되나요?",
    a: "이메일 주소를 변경하시면 이용에 제한이 생길 수 있어 권해 드리지 않습니다. 변경이 꼭 필요하시면 먼저 카카오톡 채널로 문의해 주세요.",
  },
  {
    q: "제 개인정보가 다른 사람에게 노출되지는 않나요?",
    a: "발급해 드리는 계정은 회원님이 평소 사용하시던 개인 계정과는 분리된 별도의 계정입니다. 따라서 기존 개인 계정에 담긴 정보와는 무관하며, 기존 계정의 데이터가 함께 넘어가지 않습니다.",
  },
  {
    q: "이용 중에 계정을 쓸 수 없게 되면 어떻게 되나요?",
    a: "이용 기간 중 회사의 귀책사유로 정상 이용이 불가능해진 경우에는 대체 계정을 제공해 드리거나 잔여 기간에 상응하는 이용 기간을 연장해 드립니다(이용약관 제11조 2항, 제14조 2항). 회원 귀책사유로 인한 경우에는 보상하지 않습니다. 이용에 문제가 생기면 카카오톡 채널로 접수해 주시면 확인 후 처리해 드립니다.",
  },
  {
    q: "환불은 어떤 기준으로 이루어지나요?",
    a: "이용약관 제14조 2항의 환불 정책이 적용됩니다. 구매 후 7일 이내에 서비스를 전혀 이용하지 않은 경우에는 전액 환불이 가능하고, 서비스 이용이 시작된 이후에는 원칙적으로 환불이 불가합니다. 회사의 귀책사유로 이용권 기간 내 공유계정 이용이 불가능해진 경우에는 환불 대신 대체 계정 제공 또는 잔여 기간 연장으로 보상해 드리며, 회원 귀책사유로 인한 경우에는 보상하지 않습니다. 환불 신청은 문의하기를 통해 접수해 주시면 접수일로부터 3영업일 이내에 처리해 드립니다.",
  },
  {
    q: "문의는 어디로 하면 되나요?",
    a: `카카오톡 채널 ${KAKAO_CHANNEL_TEXT} 로 문의해 주세요. 접수는 연중무휴 24시간 받고 있으며, 접수된 순서대로 답변해 드립니다.`,
  },
];

// 채널 주소만 링크로 감싸 렌더 — 화면에 보이는 글자는 JSON-LD 원문과 동일하게 유지한다.
function AnswerText({ text }: { text: string }) {
  const [before, after] = text.split(KAKAO_CHANNEL_TEXT);
  if (after === undefined) return <>{text}</>;
  return (
    <>
      {before}
      <a
        href={KAKAO_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-gold-text underline underline-offset-4 hover:text-accent-gold transition-gold"
      >
        {KAKAO_CHANNEL_TEXT}
      </a>
      {after}
    </>
  );
}

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function FaqPage() {
  return (
    <Container className="py-12 md:py-16 max-w-3xl">
      <JsonLd data={FAQ_LD} />

      <Heading variant="h2" as="h1" className="!text-2xl md:!text-3xl">
        자주 묻는 질문
      </Heading>
      <p className="mt-2 text-sm text-muted-foreground">
        주문 전 많이 물어보시는 내용을 모았습니다.
      </p>

      <section className="mt-10 rounded-2xl bg-card border border-border/50 overflow-hidden divide-y divide-border">
        {FAQ_ITEMS.map(({ q, a }) => (
          <details key={q} className="group">
            <summary className="flex cursor-pointer list-none [&::-webkit-details-marker]:hidden items-start justify-between gap-4 px-6 py-5 hover:text-accent-gold transition-gold">
              <h2 className="text-base font-semibold leading-relaxed">{q}</h2>
              <ChevronDown
                aria-hidden
                className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
              <AnswerText text={a} />
            </div>
          </details>
        ))}
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        본 안내는 이용약관을 요약한 것이며, 세부 조건은{" "}
        <Link
          href="/terms"
          className="text-accent-gold-text underline underline-offset-4 hover:text-accent-gold transition-gold"
        >
          이용약관
        </Link>
        을 따릅니다.
      </p>
    </Container>
  );
}
