# 알림톡 연동 계획 (12~13단계 구현 예정)

## 목적
- 주문 발생 시 **운영자**에게 카카오톡 알림톡 자동 발송 (관리자 페이지로 즉시 진입)
- **고객**에게 주문 완료 확인 알림톡 발송

## 발송 트리거
- DB 수준: `orders.status` 가 `pending → paid` 로 전환되는 시점.
- 구현 옵션:
  - (권장) Supabase Database Webhook → Next.js Route Handler `/api/notifications/order-paid` → 알림톡 API 호출
  - 또는 Server Action 안에서 결제 콜백 처리하며 직접 호출

## 알림톡 서비스 선정
가장 일반적인 선택지 (가맹/검수 필요):
| 서비스 | 특징 |
|---|---|
| **솔라피 (solapi.com)** | 가장 대중적, REST API 안정적, 단가 합리 |
| 알리고 (aligo.in) | 오래된 서비스, 한국 중소 사업자 선호 |
| 비즈톡 | 카카오 자체 제공, 검수 빠른 편 |

검수 기간: **1~3일** (영업일 기준). 가맹 + 발신 프로필 등록 + 템플릿 사전 등록 필수.

## 카카오 알림톡 변수 표기 형식
공통 규칙:
- 변수: **`#{변수명}`** 형식 (예: `#{주문번호}`, `#{고객명}`)
- 변수 안에 띄어쓰기 가능: `#{고객 이름}` — 단 서비스마다 규칙 다름, 솔라피 기준은 `#{변수명}` 한 토큰 권장
- 한 메시지당 변수 30개 이내 권장
- 1000자 제한 (광고형 80자, 정보성 1000자)

## 템플릿 — 운영자용 (정보성)

**제목:** 새로운 주문이 접수되었습니다

**본문:**
```
[디지털스토어 주문 알림]

주문번호: #{주문번호}
주문일시: #{주문일시}

▣ 주문자
이름: #{고객명}
연락처: #{고객연락처}
이메일: #{고객이메일}

▣ 주문 상품
#{주문상품}

▣ 결제 정보
금액: #{결제금액}원
수단: #{결제수단}

▣ 배송 메모
#{배송메모}

관리자 페이지에서 자세히 보기:
#{관리자링크}
```

**변수 매핑** (DB ↔ 템플릿):
| 변수 | 소스 |
|---|---|
| `#{주문번호}` | `orders.order_number` (예: `ORD-20260514-0001`) |
| `#{주문일시}` | `orders.created_at` 을 `YYYY-MM-DD HH:mm` 으로 KST 포맷 |
| `#{고객명}` | `orders.recipient_name` |
| `#{고객연락처}` | `orders.recipient_phone` |
| `#{고객이메일}` | `orders.recipient_email` |
| `#{주문상품}` | `order_items` 를 줄바꿈으로 join. 예: `Claude Pro 1개월 (기간: 3개월) × 1` |
| `#{결제금액}` | `orders.total.toLocaleString('ko-KR')` |
| `#{결제수단}` | `orders.payment_method` 한글 매핑 (kakaopay → 카카오페이) |
| `#{배송메모}` | `orders.memo ?? '(없음)'` |
| `#{관리자링크}` | `https://digitalst.kr/admin/orders/{orders.id}` |

**버튼 (선택):**
- "주문 확인하기" → `#{관리자링크}` 로 이동

## 템플릿 — 고객용 (정보성)

**제목:** 주문이 접수되었습니다

**본문:**
```
[디지털스토어]
#{고객명}님, 주문이 정상 접수되었습니다.

주문번호: #{주문번호}
주문 금액: #{결제금액}원

라이센스는 결제 확인 후 1분 이내에 자동 발급됩니다.
이메일(#{고객이메일})로 발급 안내가 발송됩니다.

문의는 카카오톡 채널로 부탁드립니다.
```

**버튼 (선택):**
- "주문 내역 보기" → 회원: `https://digitalst.kr/account/orders/{id}`, 비회원: 주문번호 조회 페이지

## 검수 시 주의사항
- **광고성 표현 금지** (할인, 이벤트, 추천 등 단어). 정보성 알림톡만 발송.
- **변수만 변하고 본문 구조는 고정** 이어야 통과.
- 같은 채널/같은 발신 프로필 안에서 템플릿 ID 발급받음.
- 실패 시 발송사가 자동으로 LMS(문자)로 대체 발송하는 옵션 있음.

## 구현 단계 (12~13단계 시 작업)
1. Supabase Database Webhook 등록: `orders` 테이블 UPDATE 이벤트 → POST `/api/notifications/order-paid`
2. Route Handler `/api/notifications/order-paid`:
   - 이전/이후 상태 비교 (`status` 가 `pending → paid` 인지)
   - 운영자/고객 각각 알림톡 발송
   - 발송 실패 시 큐 (테이블 `notification_queue`) 에 적재, 관리자 페이지에서 재발송 가능
3. 환경 변수 추가:
   - `KAKAO_NOTIFY_API_KEY`
   - `KAKAO_NOTIFY_API_SECRET`
   - `KAKAO_NOTIFY_TEMPLATE_ID_OPERATOR`
   - `KAKAO_NOTIFY_TEMPLATE_ID_CUSTOMER`
   - `KAKAO_NOTIFY_OPERATOR_PHONE` (수신자)
4. `src/lib/notifications/kakao.ts` 유틸 — 발송 API 래퍼

## 미해결 결정 사항 (가맹 시점에 확정)
- 알림톡 서비스 최종 선택
- 발신 프로필 (카카오 채널) 운영자 측에서 준비
- 템플릿 ID 발급 후 환경변수 등록
- 운영자 수신 전화번호 등록 위치 (env vs DB 설정 테이블)
