import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { BUSINESS_INFO } from "@/lib/business-info";
import { LegalSection } from "@/components/legal/LegalSection";

// 표준 개인정보처리방침 템플릿. 정식 오픈 전 법률 검토 권장 (TODO).

export const metadata = { title: "개인정보처리방침" };

const EFFECTIVE_DATE = "2026-05-15";

export default function PrivacyPage() {
  return (
    <Container className="py-12 md:py-16 max-w-3xl">
      <Heading variant="h2" className="!text-2xl md:!text-3xl">
        개인정보처리방침
      </Heading>
      <p className="mt-2 text-sm text-muted-foreground">
        시행일 · {EFFECTIVE_DATE}
      </p>

      <div className="mt-10 space-y-10">
        <LegalSection title="1. 수집하는 개인정보 항목">
          <ul className="list-disc pl-5 space-y-1">
            <li>이메일 주소</li>
            <li>이름</li>
            <li>휴대전화 번호</li>
            <li>결제 정보(PG사를 통해 처리, 회사는 카드 정보 자체를 저장하지 않음)</li>
            <li>주문 내역 및 라이센스 발급 정보</li>
          </ul>
        </LegalSection>

        <LegalSection title="2. 개인정보의 수집 및 이용 목적">
          <ul className="list-disc pl-5 space-y-1">
            <li>회원 가입 및 본인 확인</li>
            <li>주문 처리 및 라이센스 발급·전달</li>
            <li>고객 문의 응대 및 환불 처리</li>
            <li>서비스 안내 및 공지 전달(필수 정보에 한함)</li>
            <li>법령상 의무 이행(거래 기록 보관 등)</li>
          </ul>
        </LegalSection>

        <LegalSection title="3. 개인정보의 보유 및 이용 기간">
          <p>회원 탈퇴 시 지체 없이 파기합니다. 단, 관계 법령에 따라 일정 기간 보존이 필요한 정보는 다음과 같이 보관합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>계약 또는 청약철회 등에 관한 기록 · 5년 (전자상거래법)</li>
            <li>대금 결제 및 재화 등의 공급에 관한 기록 · 5년 (전자상거래법)</li>
            <li>소비자 불만 또는 분쟁처리에 관한 기록 · 3년 (전자상거래법)</li>
          </ul>
        </LegalSection>

        <LegalSection title="4. 개인정보의 제3자 제공">
          <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 단, 아래 경우는 예외입니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>결제 처리</strong>: PG사(토스페이먼츠 — 가맹 승인 후 연동
              예정)에 결제 진행에 필요한 정보 제공
            </li>
            <li>
              <strong>소셜 로그인</strong>: 카카오·네이버 OAuth 사용 시 해당
              플랫폼과 인증에 필요한 정보 교환 (이메일·닉네임 등 사용자가 동의한 범위)
            </li>
            <li>법령에 의거 수사기관의 요청이 있는 경우</li>
          </ul>
        </LegalSection>

        <LegalSection title="5. 이용자의 권리">
          <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>개인정보 열람 요구</li>
            <li>개인정보 정정·삭제 요구 (마이페이지에서 직접 수정 가능)</li>
            <li>개인정보 처리정지 요구</li>
            <li>회원 탈퇴 (계정 영구 삭제)</li>
          </ul>
          <p>요청은 {BUSINESS_INFO.email} 로 접수해주세요.</p>
        </LegalSection>

        <LegalSection title="6. 개인정보의 안전성 확보 조치">
          <ul className="list-disc pl-5 space-y-1">
            <li>비밀번호는 단방향 암호화되어 저장됩니다(Supabase Auth).</li>
            <li>중요 정보는 전송 구간에서 HTTPS 로 암호화됩니다.</li>
            <li>접근 권한 최소화 및 행위 로그 관리.</li>
          </ul>
        </LegalSection>

        <LegalSection title="7. 개인정보 보호책임자">
          <ul className="space-y-1">
            <li>책임자: {BUSINESS_INFO.ceo}</li>
            <li>이메일 문의: {BUSINESS_INFO.email}</li>
          </ul>
        </LegalSection>
      </div>

      <p className="mt-12 text-xs text-muted-foreground">
        ※ 본 방침은 표준 템플릿 기반의 초안입니다. 정식 오픈 전 법률 검토를
        받을 예정입니다.
      </p>
    </Container>
  );
}
