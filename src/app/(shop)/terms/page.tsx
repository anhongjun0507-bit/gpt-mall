import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { BUSINESS_INFO } from "@/lib/business-info";
import { LegalSection } from "@/components/legal/LegalSection";

// 이용약관 — 구독 계정 공유 모델. 사업자 정보는 business-info.ts 단일 소스에서.

export const metadata = { title: "이용약관" };

const EFFECTIVE_DATE = "2026-07-15";

export default function TermsPage() {
  return (
    <Container className="py-12 md:py-16 max-w-3xl">
      <Heading variant="h2" className="!text-2xl md:!text-3xl">
        이용약관
      </Heading>
      <p className="mt-2 text-sm text-muted-foreground">
        본 약관은 2026년 7월 15일부터 적용됩니다.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        시행일 · {EFFECTIVE_DATE}
      </p>

      <div className="mt-10 space-y-10">
        <LegalSection no={1} title="목적">
          <p>
            이 약관은 {BUSINESS_INFO.name}(이하 &ldquo;회사&rdquo;)가 운영하는
            디지털스토어 서비스(이하 &ldquo;서비스&rdquo;)를 이용함에 있어 회사와
            회원 간의 권리, 의무, 책임사항, 서비스 이용조건 및 절차 등 기본적인
            사항을 규정함을 목적으로 합니다.
          </p>
          <p>
            회사는 회원에게 제3자 구독형 디지털 서비스의 계정 이용 권한을
            제공하는 서비스를 운영합니다. 제공되는 계정은 회원의 단독 이용을 위한
            것이며, 다수의 회원이 공동으로 사용하는 형태가 아닙니다.
          </p>
        </LegalSection>

        <LegalSection no={2} title="약관의 게시와 효력, 개정">
          <ol className="list-decimal pl-5 space-y-1">
            <li>회사는 서비스의 가입 과정에 본 약관을 게시합니다.</li>
            <li>
              회사는 관련 법령에 위반되지 않는 범위 내에서 본 약관을 개정할 수
              있으며, 약관 변경 시 시행일 최소 7일 전 회원에게 공지합니다. 변경된
              약관은 공지된 시행일로부터 효력을 발생합니다.
            </li>
            <li>
              회원이 고지 기간 내에 변경된 약관에 대해 명시적인 거절 의사를
              표시하지 않은 경우, 변경된 약관에 동의한 것으로 간주합니다. 개정된
              약관에 동의하지 않을 경우 회원은 제14조에 따라 서비스 이용계약을
              해지할 수 있습니다.
            </li>
          </ol>
        </LegalSection>

        <LegalSection no={3} title="약관의 해석과 예외 준칙">
          <p>
            본 약관에 정의되지 않은 사항은 관련 법령이 있는 경우 그 규정을 따르며,
            그렇지 않은 경우 일반적인 상관례에 따릅니다.
          </p>
        </LegalSection>

        <LegalSection no={4} title="용어의 정의">
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              &ldquo;서비스&rdquo;라 함은 회사가 운영하는 디지털스토어
              플랫폼으로, 회원에게 제3자 구독형 디지털 서비스의 계정 이용 권한을
              제공하는 서비스를 의미합니다.
            </li>
            <li>
              &ldquo;회원&rdquo;이라 함은 회사와 서비스 이용계약을 체결하고 회사가
              제공하는 서비스를 이용하는 자를 의미합니다.
            </li>
            <li>
              &ldquo;공유계정&rdquo;이라 함은 회사가 회원에게 제공하는 제3자
              구독형 디지털 서비스의 계정으로, 해당 회원의 단독 이용을 목적으로
              제공되는 계정을 의미합니다.
            </li>
            <li>
              &ldquo;이용권&rdquo;이라 함은 회원이 일정 금액을 지불하고 일정 기간
              동안 공유계정을 이용할 수 있는 권한을 부여받는 유료 상품을
              의미합니다.
            </li>
          </ol>
        </LegalSection>

        <LegalSection no={5} title="이용계약의 체결">
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              이용계약은 회원이 서비스 가입 페이지에서 본 약관에 동의한 후 이용
              신청을 하고, 회사가 이를 승낙함으로써 체결됩니다.
            </li>
            <li>
              회사는 다음 각 호에 해당하는 신청에 대하여 승낙을 거부하거나 사후에
              이용계약을 해지할 수 있습니다.
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>가입 신청자가 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>타인의 정보를 도용하여 신청한 경우</li>
                <li>허위 정보를 기재하거나 필수 입력 사항을 기재하지 않은 경우</li>
                <li>부정한 목적으로 서비스를 이용하려는 경우</li>
                <li>14세 미만인 경우</li>
                <li>기타 회사의 정책에 적합하지 않다고 판단되는 경우</li>
              </ul>
            </li>
            <li>회원은 이용권 이용 중이 아닌 경우 언제든지 탈퇴를 요청할 수 있습니다.</li>
          </ol>
        </LegalSection>

        <LegalSection no={6} title="개인정보보호 의무">
          <p>
            회사는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련
            법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다.
            개인정보의 수집·이용·제공 등에 관해서는 회사의 개인정보처리방침이
            적용됩니다.
          </p>
        </LegalSection>

        <LegalSection no={7} title="회원의 아이디 및 비밀번호">
          <ol className="list-decimal pl-5 space-y-1">
            <li>회원은 아이디와 비밀번호의 관리에 대한 책임이 있습니다.</li>
            <li>회원은 아이디와 비밀번호를 제3자에게 제공하거나 누설하여서는 안 됩니다.</li>
            <li>
              회사는 회원의 아이디와 비밀번호 관리 소홀로 인하여 발생한 손해에
              대하여 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.
            </li>
          </ol>
        </LegalSection>

        <LegalSection no={8} title="회사의 의무">
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              회사는 관련 법령과 이 약관이 금지하거나 미풍양속에 반하는 행위를
              하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여 최선을
              다하여 노력합니다.
            </li>
            <li>회사는 회원으로부터 제기되는 정당한 의견이나 불만을 신속하게 처리합니다.</li>
          </ol>
        </LegalSection>

        <LegalSection no={9} title="회원의 의무">
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              회원은 다음 각 호의 행위를 하여서는 안 됩니다.
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>이용 신청 또는 회원정보 변경 시 허위 내용을 등록하는 행위</li>
                <li>타인의 정보 도용 행위</li>
                <li>회사가 게시한 정보의 무단 변경 행위</li>
                <li>회사 또는 제3자의 지적재산권을 침해하는 행위</li>
                <li>회사 또는 다른 회원을 모욕·위협하는 행위</li>
                <li>서비스의 정상적인 운영을 방해하는 행위</li>
                <li>기타 관련 법령에 위반되는 행위</li>
              </ul>
            </li>
            <li>
              회원이 전항의 의무를 위반한 경우 회사는 서비스 이용을 제한하거나
              이용계약을 해지할 수 있습니다.
            </li>
          </ol>
        </LegalSection>

        <LegalSection no={10} title="서비스의 제공 및 변경">
          <ol className="list-decimal pl-5 space-y-1">
            <li>회사는 회원에게 공유계정 이용 권한을 제공하는 서비스를 제공합니다.</li>
            <li>
              회사는 서비스의 안정적인 제공을 위하여 필요한 경우 서비스의 내용,
              이용 방법 등을 변경할 수 있으며, 변경 사항은 사전에 공지합니다.
            </li>
            <li>
              회사는 천재지변, 시스템 점검, 통신 두절 등 불가피한 사유가 있는 경우
              서비스 제공을 일시적으로 중단할 수 있습니다.
            </li>
          </ol>
        </LegalSection>

        <LegalSection no={11} title="서비스 이용 시 주의사항 및 이용 기간 보장">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              회사는 회원에게 회사가 직접 관리하는 공유계정을 제공합니다. 해당
              공유계정은 회원의 단독 이용을 위한 것이며, 다른 회원과 공동으로
              사용하는 형태가 아닙니다. 회원은 제공받은 계정의 비밀번호를 직접
              변경하고 OTP(일회용 비밀번호)를 설정하여 안전하게 이용할 수 있습니다.
            </li>
            <li>
              이용 기간 보장
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>
                  회사는 회원이 구매한 이용권의 유효 기간 동안 공유계정이
                  정상적으로 이용 가능하도록 성실히 관리합니다.
                </li>
                <li>
                  이용권 유효 기간 내에 회사의 귀책사유로 인하여 공유계정 이용이
                  불가능해진 경우, 회사는 지체 없이 대체 계정을 제공하거나 잔여
                  기간에 상응하는 이용 기간을 연장하여 보상합니다.
                </li>
              </ul>
            </li>
            <li>
              회원은 자신이 이용하는 제3자 디지털 서비스의 이용약관(특히 계정 이용
              및 보안 관련 조항)을 사전에 확인하고 준수하여야 합니다. 회원이 원
              서비스 제공사의 이용약관을 위반하여 계정이 정지되거나 이용이
              제한되는 경우, 이에 따른 손해에 대하여 회사는 책임을 지지 않습니다.
            </li>
            <li>
              회사는 다음 각 호의 사유로 인한 손해에 대하여 책임을 지지 않습니다.
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>원 서비스 제공사의 정책 변경, 기술적 장애 또는 계정 정지</li>
                <li>
                  회원의 부주의(비밀번호 유출, OTP 미설정, 2단계 인증 설정 변경
                  등)로 인한 이용 장애
                </li>
                <li>이용권 기간 종료 후 발생한 문제</li>
                <li>
                  천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적 사유
                </li>
              </ul>
            </li>
          </ol>
        </LegalSection>

        <LegalSection no={12} title="정보 제공">
          <p>
            회사는 서비스 이용에 필요하다고 인정되는 정보를 회원이 등록한
            휴대전화 문자메시지 또는 기타 방법으로 제공할 수 있습니다.
          </p>
        </LegalSection>

        <LegalSection no={13} title="서비스 이용의 제한">
          <p>
            회사는 천재지변, 국가비상사태, 해결이 곤란한 기술적 결함 등
            불가항력적인 사유가 발생한 경우 서비스의 전부 또는 일부를 예고 없이
            제한하거나 중지할 수 있습니다.
          </p>
        </LegalSection>

        <LegalSection no={14} title="서비스 이용의 중지·해지 및 환불정책">
          <div className="space-y-1">
            <p className="font-medium text-foreground">1. 회원 탈퇴</p>
            <p>
              이용권을 이용하고 있지 않은 회원은 언제든지 회사에 탈퇴를 요청할 수
              있으며, 회사는 지체 없이 처리합니다.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">2. 환불 정책</p>
            <p>
              본 서비스는 디지털 콘텐츠 이용권으로서 「전자상거래 등에서의
              소비자보호에 관한 법률」 제17조에 따라 청약철회가 제한될 수 있습니다.
              구체적인 환불 기준은 다음과 같습니다.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                구매 후 7일 이내에 서비스를 전혀 이용하지 않은 경우: 전액 환불
                가능
              </li>
              <li>서비스 이용이 시작된 이후: 원칙적으로 환불이 불가합니다.</li>
              <li>
                회사의 귀책사유로 이용권 기간 내 공유계정 이용이 불가능해진 경우:
                환불 대신 대체 계정 제공 또는 잔여 기간 연장으로 보상합니다. (회원
                귀책사유로 인한 경우 보상하지 않음)
              </li>
              <li>
                환불 신청은 서비스 내 문의하기를 통해 접수하며, 접수일로부터
                3영업일 이내에 처리합니다.
              </li>
            </ul>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">3. 이용권 해지</p>
            <p>
              이용권은 구매한 기간 동안 유효하며, 중도 해지 시 위 환불 정책이
              적용됩니다.
            </p>
          </div>
        </LegalSection>

        <LegalSection no={15} title="책임 제한">
          <ol className="list-decimal pl-5 space-y-1">
            <li>회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
            <li>회사는 서비스를 통하여 게재한 정보의 신뢰도·정확성 등에 대하여 보증하지 않습니다.</li>
            <li>
              회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지, 제3자의 고의
              또는 과실로 인하여 서비스를 제공할 수 없는 경우 책임을 면제합니다.
            </li>
            <li>
              회원은 자신의 결정에 따라 서비스를 이용함으로써 발생하는 컴퓨터
              시스템 손상, 데이터 유실 등에 대한 책임을 스스로 집니다.
            </li>
          </ol>
        </LegalSection>

        <LegalSection no={16} title="준거법 및 재판관할">
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              회사와 회원 간에 발생한 분쟁에 관하여는 대한민국 법률을 준거법으로
              합니다.
            </li>
            <li>
              회사와 회원 간의 분쟁에 관한 소송은 민사소송법상 관할 법원에
              제기합니다.
            </li>
          </ol>
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
    </Container>
  );
}
