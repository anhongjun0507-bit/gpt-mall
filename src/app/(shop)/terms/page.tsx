import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { BUSINESS_INFO } from "@/lib/business-info";
import { LegalSection } from "@/components/legal/LegalSection";

// 표준 전자상거래 이용약관 템플릿. 사업자 정보는 business-info.ts 단일 소스에서.
// 정식 오픈 전 법률 검토 권장 (TODO).

export const metadata = { title: "이용약관" };

const EFFECTIVE_DATE = "2026-05-15";

export default function TermsPage() {
  return (
    <Container className="py-12 md:py-16 max-w-3xl">
      <Heading variant="h2" className="!text-2xl md:!text-3xl">
        이용약관
      </Heading>
      <p className="mt-2 text-sm text-muted-foreground">
        시행일 · {EFFECTIVE_DATE}
      </p>

      <div className="mt-10 space-y-10">
        <LegalSection no={1} title="목적">
          <p>
            본 약관은 {BUSINESS_INFO.name}(이하 &ldquo;회사&rdquo;)가
            {" "}{BUSINESS_INFO.siteUrl} 에서 제공하는 디지털 콘텐츠 및 라이센스
            판매 서비스(이하 &ldquo;서비스&rdquo;) 이용에 관한 권리·의무 및
            책임사항을 규정하는 것을 목적으로 합니다.
          </p>
        </LegalSection>

        <LegalSection no={2} title="정의">
          <ol className="list-decimal pl-5 space-y-1">
            <li>&ldquo;이용자&rdquo;란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
            <li>&ldquo;라이센스&rdquo;란 회사가 판매하는 디지털 소프트웨어 사용 권리 증서를 말합니다.</li>
            <li>&ldquo;결제 완료&rdquo;란 PG사를 통해 결제가 정상 승인된 시점을 말합니다.</li>
            <li>&ldquo;라이센스 발급&rdquo;이란 결제 완료 후 이용자에게 라이센스 키가 전달된 시점을 말합니다.</li>
          </ol>
        </LegalSection>

        <LegalSection no={3} title="약관의 효력 및 변경">
          <p>
            본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는
            관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경
            시점에는 사이트 공지로 안내합니다.
          </p>
        </LegalSection>

        <LegalSection no={4} title="서비스의 제공">
          <ol className="list-decimal pl-5 space-y-1">
            <li>회사는 라이센스 정보 제공, 결제, 발급, 발급 후 사용 안내를 포함한 디지털 콘텐츠 거래 서비스를 제공합니다.</li>
            <li>회사는 천재지변, 시스템 점검 등 불가피한 경우 서비스 제공을 일시 중단할 수 있습니다.</li>
          </ol>
        </LegalSection>

        <LegalSection no={5} title="계약의 성립">
          <p>
            이용자가 주문서 작성 후 결제하고 회사가 결제 완료를 확인한 시점에
            구매 계약이 성립합니다.
          </p>
        </LegalSection>

        <LegalSection no={6} title="결제 수단">
          <ol className="list-decimal pl-5 space-y-1">
            <li>회사는 다음 결제 수단을 제공합니다: 신용카드, 카카오페이, 네이버페이.</li>
            <li>이용자는 결제 정보가 정확함을 확인할 책임이 있으며, 부정확한 정보로 인한 손해는 이용자가 부담합니다.</li>
          </ol>
        </LegalSection>

        <LegalSection no={7} title="환불 정책">
          <p>디지털 상품의 특성상 다음 환불 규정을 따릅니다.</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              <strong>라이센스 발급 전 결제 취소</strong>: 100% 환불.
              결제 후 1시간 이내 또는 발급 처리 전에 한합니다.
            </li>
            <li>
              <strong>라이센스 발급 완료 후</strong>: 환불 불가.
              「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항 제5호
              (디지털 콘텐츠 사용 시작 시 청약철회 제한)에 따릅니다.
            </li>
            <li>
              <strong>라이센스 자체에 결함이 있어 사용 불가한 경우</strong>:
              100% 환불 또는 정상 상품 재발급.
            </li>
            <li>
              <strong>사용 이력이 있는 라이센스의 일부 사용 후 환불 요청</strong>:
              사용일수 비례 차감 후 환불 검토(회사 재량).
            </li>
          </ol>
          <p>
            환불 요청은 {BUSINESS_INFO.email} 로 주문번호와 함께 접수해주세요.
          </p>
        </LegalSection>

        <LegalSection no={8} title="이용자의 의무">
          <ol className="list-decimal pl-5 space-y-1">
            <li>이용자는 라이센스를 본인만 사용해야 하며, 양도·재판매·공유할 수 없습니다.</li>
            <li>이용자는 회사가 제공한 라이센스 키를 외부에 공개하거나 제3자에게 양도해서는 안 됩니다.</li>
            <li>이용자가 위 의무를 위반해 발생한 손해는 이용자가 부담합니다.</li>
          </ol>
        </LegalSection>

        <LegalSection no={9} title="회사의 면책">
          <ol className="list-decimal pl-5 space-y-1">
            <li>회사는 천재지변, 전쟁, 정전, 통신 장애 등 불가항력으로 인한 서비스 제공 불가에 대해 책임지지 않습니다.</li>
            <li>회사는 라이센스 발급 후 이용자의 부주의로 인한 키 분실·도용에 대해 책임지지 않습니다.</li>
          </ol>
        </LegalSection>

        <LegalSection no={10} title="분쟁 해결">
          <p>
            본 약관과 관련된 분쟁은 대한민국 법에 따르며, 관할 법원은 회사
            주소지 관할 법원으로 합니다.
          </p>
        </LegalSection>

        <LegalSection title="회사 정보">
          <ul className="space-y-1">
            <li>상호: {BUSINESS_INFO.name}</li>
            <li>대표자: {BUSINESS_INFO.ceo}</li>
            <li>사업자등록번호: {BUSINESS_INFO.brn}</li>
            <li>통신판매업신고번호: {BUSINESS_INFO.mailOrderLicense}</li>
            <li>주소: {BUSINESS_INFO.address}</li>
            <li>이메일 문의: {BUSINESS_INFO.email}</li>
          </ul>
        </LegalSection>
      </div>

      {/* 정식 검토 안내 */}
      <p className="mt-12 text-xs text-muted-foreground">
        ※ 본 약관은 표준 템플릿 기반의 초안입니다. 정식 오픈 전 법률 검토를
        받을 예정입니다.
      </p>
    </Container>
  );
}
