# 텔레그램 봇 셋업

운영자에게 새 주문 알림을 텔레그램으로 받기 위한 셋업.
환경변수 두 개(`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) 만 채우면 즉시 작동.

## 1. 텔레그램 앱 설치 + 본인 계정 로그인
- iOS / Android / Web 어느 쪽이든 OK.

## 2. 봇 생성 — @BotFather
1. 텔레그램에서 **@BotFather** 검색 → 대화 시작
2. `/newbot` 입력
3. 봇 이름(아무거나, 사용자에게 보임): **`디지털스토어 알림`**
4. 봇 사용자명(고유, `_bot` 으로 끝나야 함): **`digitalst_notify_bot`** (이미 쓰는 사람 있으면 다른 이름)
5. BotFather 가 응답에 **HTTP API 토큰** 을 줌. 형식: `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ012345678`
6. 이 토큰을 안전하게 보관 (메신저로 다시 보내지 말 것)

## 3. 운영자 chat_id 확인 — @userinfobot
1. 텔레그램에서 **@userinfobot** 검색 → 대화 시작
2. `/start`
3. 응답에 표시되는 **Id** 값이 본인 chat_id (정수, 예: `5874321987`)
4. 단체 채팅방으로 보내고 싶다면 해당 채팅방의 chat_id 가 따로 있음 — @userinfobot 을 그 그룹에 초대 후 `/start` 로 확인 가능

## 4. 본인 ↔ 봇 첫 대화 시작 (중요)
- 텔레그램에서 방금 만든 봇(예: `@digitalst_notify_bot`) 검색
- 대화 시작 → **`/start`** 입력 (또는 아무 메시지)
- ⚠️ 이걸 안 하면 봇이 메시지를 보내려 할 때 `403: bot can't initiate conversation with a user` 에러로 실패

## 5. 환경변수 등록
### 로컬 (`.env.local`)
```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ012345678
TELEGRAM_CHAT_ID=5874321987
```

### Vercel (production / preview / development 모두)
```bash
vercel env add TELEGRAM_BOT_TOKEN production
vercel env add TELEGRAM_CHAT_ID production
# (preview / development 도 동일하게)
```
또는 Vercel 대시보드 → Settings → Environment Variables 에서 입력.

## 6. 재배포
```bash
npx vercel@latest --prod --yes
```
(이 프로젝트는 GitHub Integration 미연결이라 매번 CLI deploy 필수.
[[project-deploy-workflow]] 참조)

## 7. 동작 테스트
1. `https://www.digitalst.kr/products` → 임의 상품 → 카트 → `/checkout` → 정상 정보로 주문
2. 텔레그램 봇 대화창에 다음 형식으로 알림 도착:
   ```
   🛒 새 주문 접수

   주문번호: ORD-YYYYMMDD-XXXX
   결제금액: ₩28,000
   결제수단: 카카오페이

   주문자: 홍길동
   휴대전화: 010-1234-5678

   주문 상품
   • Claude Pro 1개월 × 1

   관리자 페이지 열기
   ```
3. 도착 안 하면:
   - Vercel Function Logs 에 `[telegram] …` 메시지 확인
   - `bot can't initiate conversation` → 4번 단계(첫 대화) 빠짐
   - 토큰 오타 / chat_id 오타 검토

## 동작 규약 (안전)
- 환경변수 비어있으면 → `console.warn` 만, 주문은 정상 완료
- 발송 실패(타임아웃 5초 포함) → `console.error` 만, 주문은 정상 완료
- 사용자 입력값(이름·휴대전화·요청사항·상품명)은 HTML escape 처리 (parse_mode=HTML)
- 메시지 본문은 `src/lib/notifications/telegram.ts` 의 `formatOrderMessage` 에 정의

## 향후 확장
- 결제 완료(`markOrderPaid`) 시점 별도 알림
- 환불 처리 알림
- 단체 채팅방(운영팀)으로 보내기 — chat_id 만 그룹 ID 로 바꾸면 됨
