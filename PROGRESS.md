## 2026-08-24 — FAQ 실제 운영 반영 + 발급 시간 안내 (완료)
- `/faq` FAQ_ITEMS 1·2·3·5·8번 답변 교체(`e97f0cd`): 제공 방식은 유튜브 프리미엄=가족 그룹 초대 / 그 외=개별 이용 계정·이용권 활성화로 분리, 발급 시간은 상품별 분기 없는 포괄 문구(최대 24시간). 3번은 가족 그룹 초대 상품 한정, 5번은 개별 이용 계정 한정 명시, 8번은 약관 제11조 2항·제14조 2항 범위 내 보강.
- 상품 상세 구매 버튼 하단 제공 방식 고지 + `/faq` 링크, `/order/complete` 무통장 입금 안내 아래 발급 소요 단일 문구 추가(`d15b3d0`). DB·Supabase 상품 데이터 미수정. main push·프로덕션 배포 완료.
- 검증 V1~V8 통과: tsc 0·build exit 0 / `/faq` 200·h1 1·질문 10 / FAQPage JSON-LD 10쌍 DOM 텍스트 완전 일치 / 금지어 4종 0건(단 `/privacy` 의 "정식 오픈 전 법률 검토" 1건은 기존 문구, 라이센스 주장 아님) / 상품 상세 고지·링크 노출·레이아웃 정상 / order/complete 문구 서버 번들 확인 / 전 페이지 noindex 유지 / 15라우트 정상(account·admin 307)·푸터 `/faq` 링크 정상.
- 특이사항: 현재 라이브 활성 상품은 `gemini-pro` 1개뿐(요청서의 "상품 상세 3개" 미해당). 상품 상세 신뢰 지표의 "즉시 발급" 배지는 최대 24시간 안내와 상충 — 이번 범위 밖이라 미수정.
- 다음(3단계): layout.tsx 전역 robots noindex 해제 — 아직 하지 말 것.

## 2026-08-18 — SEO 2단계: FAQ 페이지 + 구조화 데이터 (완료)
- `/faq` 신설(`src/app/(shop)/faq/page.tsx`): details/summary 아코디언 10문항. 답변 원문은 파일 내 `FAQ_ITEMS` 단일 소스로 화면·JSON-LD 공유. 환불 답변은 이용약관 제14조 2항(7일 내 미이용 전액환불/이용개시 후 불가/회사 귀책 시 대체계정·기간연장/3영업일 처리) 원문 그대로, 제11조 2항도 인용.
- FAQPage JSON-LD(기존 JsonLd 헬퍼 재사용) + sitemap STATIC_PATHS 에 `/faq` + 푸터 Help 열 "자주 묻는 질문" 링크. 커밋 `c464f24`(페이지)/`2af3766`(구조화·연결), main push·프로덕션 배포 완료.
- 홈 카피 금지어(정품·공식·정식·라이센스·인증) 0건 → 3번째 커밋 없음. FAQ 본문도 "2단계 인증" 대신 "OTP(일회용 비밀번호)" 표기로 금지어 회피.
- 검증 V1~V8 전부 통과: tsc 0·build 0 / `/faq` 200·h1 1개·질문 10 / JSON-LD 질문 10 + 화면 텍스트 완전 일치 / 금지어 0 / sitemap 9 URL 전부 www / 전 페이지 noindex 유지 / 회귀 15라우트(account·admin 307) 정상 / canonical `https://www.digitalst.kr/faq`.
- 다음(3단계): layout.tsx 전역 robots noindex 해제 — 아직 하지 말 것.

## 2026-08-18 — 네이버 로그인 제거 완료 (검수 반려로 철수)
- 코드: SocialButtons 네이버 버튼·아이콘·핸들러, login 의 `naver_*` 에러 배너, `/auth/naver/start`·`/auth/callback/naver`·`lib/naver-oauth.ts` 삭제. `naverpay` 결제수단 3파일은 기존 주문 호환용으로 보존. 커밋 `fc28648`(feat)+`9ebb792`(docs), main push·프로덕션 배포 완료.
- env: `.env.local` 3키 + Vercel 3환경 9건 모두 제거. docs/AUTH_SETUP.md §4 는 "검수 반려로 제거, 복원 시 `ded1dbf` 참조" 한 줄로 대체.
- 검증 V1~V8 전부 통과: tsc 0 error·build OK / src 내 naver 는 naverpay 3파일만 / 라이브 두 라우트 404 / login·signup HTML 네이버 0건 + 카카오 버튼 정상 / 회귀 10라우트 200·account·admin 307 / vercel env NAVER 0 / 월 환산가(월 4,833원) 유지.
- 테스트 계정 3개(anhongjun0507·sb80000·aibike @naver.com) 삭제 → auth.users 7→4명, profiles 4행. 주문은 8건 그대로이며 `ORD-20260516-CD21` 은 `user_id=null`·`user_withdrawn_at=null` 로 admin 에서 "비회원" 표시(운영자 정리라 탈퇴 스탬프 미기입).
- 미완: GitHub main 브랜치 보호 — 이 환경에 PAT 없음(git 은 SSH 키, gh CLI 미설치)으로 API 401. 웹 UI 또는 PAT 필요.
