## 2026-08-24 — 상품 문구 DB 반영 (코드 변경 없음)
- Supabase `products` 4개 전부 `short_description` 클라이언트 컨펌 문구로 교체. `youtube-premium.description` 의 "- 빠른 초대장 전송, 사용즉시 적용" → "- 초대장 전송 후 수락하면 적용됩니다" (나머지 3개 description 은 속도 단정 표현 없어 원문 유지).
- `name`·`is_active` 미변경(false/true/false/false 그대로) — 월 환산가 "N개월" 패턴·판매 여부 유지.
- 검증: 라이브 `/products/gemini-pro` 본문·meta description·og:description·Product JSON-LD 전부 새 문구 반영, 월 4,833원 유지, 금지어(속도 단정+정품 계열) 0건, 16라우트 정상.
- 참고: `/products` 목록의 ProductCard 는 short_description 을 렌더하지 않는 구조라 목록 화면에는 문구가 노출되지 않음(설계상 정상).

## 2026-08-24 — 색인 요청 준비: 시행일 표기·sitemap lastmod·홈 h1
- `/privacy` 에 `LAST_REVISED = "2026-08-24"` 추가, 시행일/최종 개정일 2줄 구조로 노출(`45a06bf`). `/terms` 는 개정 사실이 없어 미수정(동일 구조라 필요 시 상수만 추가하면 됨).
- `sitemap.ts` 의 `STATIC_PATHS` 배열을 `STATIC_LAST_MODIFIED` 맵으로 바꿔 정적 6경로에 `lastModified` 부여(`2e5230b`). 값은 각 페이지 파일의 최종 커밋 시각(git log)이며 `new Date()` 미사용 — 배포마다 전 경로가 갱신되는 것을 막기 위함. 콘텐츠 개정 시 이 맵을 손으로 갱신해야 한다.
- 홈 h1 정정(`9bdeff7`): 베스트셀러 섹션 제목의 `as="h1"` 제거(h2 복귀) + 히어로 Container 안에 `sr-only` h1 "유튜브 프리미엄·제미나이 Pro 구독 공유" 배치. 히어로엔 태그라인(p)뿐이라 시각 제목이 없어 sr-only 선택, 화면 변화 0.
- 검증 V1~V6 통과: tsc 0·build exit 0 / `/privacy` 2줄 노출 확인 / sitemap 7 URL 전부 lastmod 존재·빌드 시각 아님 / 홈 h1 1개(sr-only)·h2 "지금 가장 인기있는"·스크린샷 1280/390 시각 변화 없음 / 공개 7 index,follow·비공개 7 noindex(account·admin 307) / 16라우트 정상.
- 참고: privacy 페이지 맵 값(08:48:48Z)은 오늘 커밋 직전 시각 — 날짜(2026-08-24)는 동일해 실무상 영향 없음.

## 2026-08-24 — 개인정보처리방침 제3자 제공 정정 + 색인 요청 사전 점검
- `/privacy` §4 제3자 제공의 "카카오·네이버 OAuth" → "카카오 OAuth" (`06f36f7`). privacy 전수 검색 결과 네이버 언급은 이 1곳뿐이었고, §1 수집 항목·§2 이용 목적에는 네이버 관련 서술 없음. 그 외 법정 고지(토스페이먼츠 연동 예정 등)는 미수정.
- 시행일은 `EFFECTIVE_DATE = "2026-05-15"` 단일 필드뿐이고 개정일 표기 방식이 코드에 없음(terms 도 동일 구조) → 임의 추가하지 않고 보고만. 실질 개정이라 시행일 갱신 여부는 클라이언트 판단 필요.
- 색인 요청 사전 점검(읽기 전용): sitemap `lastmod` 은 활성 상품 1건만 `products.updated_at`(2026-08-11) 을 반영하고 정적 6개는 값이 없음 — 콘텐츠를 여러 번 고친 `/faq`·`/privacy` 는 실제 변경 시각 미반영. 홈 h1 이 "지금 가장 인기있는"(베스트셀러 섹션 제목)이라 페이지 대표 h1 부재. 상품 상세 description 은 `short_description` 원문이라 검색결과 노출 문구가 "gemini pro 12개월 계정 (단독사용, 개인정보, password 변경가능)".
- 검증 V1~V5 통과: tsc 0·build exit 0 / `/privacy` 200·네이버 0건·카카오 유지 / 공개 7 index,follow·비공개 7 noindex 유지 / sitemap 7 URL / 16라우트 정상.

## 2026-08-24 — SEO 3단계: 색인 개방 (완료)
- `layout.tsx` 전역 `robots {index:false}` → `{index:true, follow:true}` 명시 전환(`f54df71`). 비공개 구간은 `(auth)`·`(shop)/account`·`admin` layout 과 cart·checkout·order/complete page 의 개별 noindex 가 그대로 방어 — 라이브 7개 페이지 HTML + layout 청크(4821·1349·8439·3684) 로 확인.
- og.svg 부제 "즉시 발급" → "합리적인 가격", og.png 재생성(`016dbdb`). 재생성 전 `fonts-noto-cjk` 설치 필요(없으면 한글이 비트맵 폰트로 깨짐 — dpkg 중단 상태 복구 후 설치).
- `/privacy` 하단 "표준 템플릿 초안 · 정식 오픈 전 법률 검토 예정" 고객 노출 문구 + 동일 취지 TODO 주석 제거(`237d89c`).
- 검색엔진 소유확인: `src/lib/site-verification.ts` + 미들웨어 진입점(`1319e24`). 파일명에 토큰이 박혀 정적 라우트 불가, `app/[segment]` 는 최상위 404 를 삼켜서 미들웨어 방식 채택. `GOOGLE_SITE_VERIFICATION`/`NAVER_SITE_VERIFICATION` 미설정 시 404. metadata.verification 도 동일 env 로 병행. **토큰 주입 후 재배포 필요.**
- 함정: Edge 런타임은 `process.env[변수]` 동적 접근이 항상 undefined → 리터럴 접근으로 수정(`491cba2`). 로컬 `next start` 로 200 + 올바른 본문·`x-robots-tag: noindex` 확인.
- 미해결(보고만): `/privacy` 제3자 제공 항목에 "네이버 OAuth" 가 남아 있으나 네이버 로그인은 2026-08-18 제거됨 — 법정 고지라 임의 수정하지 않음. 상품 `short_description` 개선안도 제안만 하고 DB 미수정.

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

## 2026-08-24 — 발급 속도 문구 정합성 정리
- 전수 조사 결과 FAQ 기준(최대 24시간)과 상충하는 코드 문구 3곳 발견: 상품 상세 신뢰 지표 "즉시 발급"(`products/[slug]/page.tsx:208`), 장바구니 "결제 완료 후 즉시 발송됩니다"(`CartContent.tsx:106-108`), 주문 완료 카드결제 분기 "자동 발급되어"(`order/complete/page.tsx:206`).
- 각각 "빠른 발급" / "입금 확인 후 순차적으로 발급되며 최대 24시간 이내에 안내드립니다" / "순차적으로 발급해 드리며, 최대 24시간 이내에" 로 교체. 커밋 `b83735f`, main push·프로덕션 배포 완료.
- DB 미수정(보고만): `youtube-premium.description` 에 "빠른 초대장 전송, 사용즉시 적용" 1건 — 해당 상품은 `is_active=false`(2026-08-23 12:24 UTC 비활성) 라 라이브 노출 없음. 활성 상품은 `gemini-pro` 단 1개.
- 검증: tsc 0·build 0 / 라이브 전 공개 페이지 "즉시 발급·즉시 발송·자동 발급" 0건, 상품 상세 "빠른 발급" 렌더 확인 / `/faq` FAQPage JSON-LD 10문항·본문 완전 일치 / 16라우트 noindex 유지 / sitemap 7 URL(정적 6 + gemini-pro).

## 2026-08-24 — 프로덕션 E2E 자동 검증 (Playwright, 코드 변경 없음)
- 입금 확인 버튼: `ORD-20260816-37DD` awaiting_deposit → paid 전환 성공(화면 "결제 완료" + DB `paid_at` 기입, 버튼 사라짐).
- 탈퇴 흐름 전 구간 통과: e2e 계정으로 실제 checkout UI 경유 무통장 주문(`ORD-20260824-36DC`) → 미완료 주문 가드가 "진행 중인 주문이 있어 탈퇴할 수 없습니다…" 로 차단 → 관리자 cancelled 처리 후 탈퇴 성공 → 재로그인 차단 → 주문 행 보존(`user_id=NULL`, `user_withdrawn_at` 기입) + admin 목록·상세 "(탈퇴한 회원)" 라벨 확인.
- 시각 판정(스크린샷 육안): `/faq` 1280·390 및 details 전개 정상(겹침·잘림 없음, sticky 헤더 정상), 상품 상세 "제공 방식…" 안내·"빠른 발급"·월 4,833원 정상 노출, `og.png` 한글 렌더 정상.
- 발견(미수정): `public/og.svg`/`og.png` 문구가 아직 "구독 공유, 즉시 발급" — 2026-08-24 발급 속도 문구 정합성 작업에서 누락된 마지막 1곳.
- 인프라: Vercel↔Git 연결 실패 — Vercel 계정에 연결된 GitHub 는 `sbind0001` 인데 저장소는 `anhongjun0507-bit/gpt-mall` 소유라 `repo_no_access`. 웹 UI 에서 해당 GitHub 계정 연결 필요. main 브랜치 보호는 여전히 PAT 부재.
- 정리: 두 테스트 주문 행 삭제 → orders 8→7건, auth.users 5명(e2e 계정은 탈퇴로 소멸), profiles 5행. 스크린샷은 `e2e-shots/`, 스크립트는 `e2e/` (커밋 안 함).

## 2026-08-26 — 검색엔진 소유확인 토큰 주입·반영 (코드 변경 없음)
- Vercel env 에 `GOOGLE_SITE_VERIFICATION=_GgEif4ml…mEcyM` / `NAVER_SITE_VERIFICATION=e72a5a23…16ab0a` 를 Production·Preview·Development 3환경 모두 등록(6건), `.env.local` 에도 동일 추가. Edge 미들웨어가 빌드 시점 치환이라 `vercel --prod --token` 재배포까지 실행.
- 라이브 검증: 홈 HTML 에 두 meta 모두 값 일치 출력, HTML 파일 방식 `/google_GgEif4ml…mEcyM.html` 200(text/plain)·`/navere72a5a23…16ab0a.html` 200(text/html) 내용 일치, 오타 토큰 `/googlewrongtoken.html` 404 유지.
- 루트 metadata 라 meta 는 HTML 을 반환하는 전 페이지(공개 7 + cart·checkout·login·signup 등)에 동일 출력. 307 리다이렉트 라우트(account·admin 하위)는 본문이 없어 미출력 — 정상.
- 회귀 무변화: 공개 7 `index, follow` / 비공개 7 `noindex, nofollow` 또는 307 / `/sitemap.xml` 200·7 URL / `/robots.txt` 200 / 16라우트 상태코드 동일.
