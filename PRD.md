# PRD — AI 소프트웨어 라이센스 쇼핑몰

## 1. 개요
- **프로젝트명:** AI 소프트웨어 라이센스 판매 쇼핑몰 (가칭 gpt-mall)
- **클라이언트:** 이현석
- **참고 사이트:** [ssolasoft.com](https://ssolasoft.com)
- **납기:** 2026-05-17
- **목적:** AI 소프트웨어(GPT 기반 도구, 라이센스형 SaaS 등) 의 온라인 판매 채널 구축

## 2. 기술 스택
| 구분 | 선택 | 비고 |
|---|---|---|
| Framework | Next.js 14 (App Router) | 서버 컴포넌트 기본 |
| Language | TypeScript 5 | strict 모드 |
| Styling | Tailwind CSS 3 | |
| DB / Auth / Storage | Supabase | Postgres + Auth + Storage |
| 호스팅 | Vercel | Edge / Node runtime 혼합 |
| 아이콘 | lucide-react | |
| 유틸 | clsx + tailwind-merge | className 머지 |

## 3. 페이지 구성
| 경로 | 페이지 | 설명 |
|---|---|---|
| `/` | 메인 | 히어로, 추천 상품, 카테고리 진입 |
| `/products` | 상품 목록 | 카테고리/검색/정렬 필터 |
| `/products/[slug]` | 상품 상세 | 라이센스 옵션, 설명, 구매 버튼 |
| `/cart` | 장바구니 | 수량 변경, 합계, 주문서 이동 |
| `/checkout` | 주문서 | 결제 수단 선택, 약관 동의 |
| `/checkout/complete` | 주문 완료 | 영수증, 라이센스 발급 안내 |
| `/account` | 마이페이지 | 주문 내역, 라이센스 키, 회원정보 |
| `/account/orders/[id]` | 주문 상세 | 라이센스 키 재발급, 영수증 |
| `/auth/login` | 로그인 | 이메일 + 소셜 |
| `/auth/callback` | 소셜 콜백 | Supabase OAuth 리다이렉트 |
| `/admin` | 관리자 대시보드 | 매출 요약, 최근 주문 |
| `/admin/products` | 상품 관리 | CRUD |
| `/admin/orders` | 주문 관리 | 상태 변경, 라이센스 발급 |
| `/admin/users` | 회원 관리 | 권한 변경 |

## 4. 인증
- **공급자:** Supabase Auth
- **로그인 방법:**
  - 이메일 + 비밀번호
  - 네이버 OAuth (Supabase Custom OAuth Provider 사용)
  - 카카오 OAuth (Supabase Custom OAuth Provider 사용)
- **세션:** `@supabase/ssr` 기반 쿠키 세션 — 서버 컴포넌트에서 사용자 조회 가능
- **권한:** `profiles.role` (`user` / `admin`) 컬럼으로 관리. 관리자 라우트는 미들웨어에서 차단.

## 5. 결제
- **현재 상태:** PG 가맹 승인 전 — UI/주문 플로우만 선구축, 결제 모듈은 추후 연동
- **승인 후 연동 예정:**
  - 카카오페이
  - 네이버페이
  - 신용카드 (PG사 표준 모듈)
- **선구축 범위:**
  - 주문 생성 / 결제 대기 상태 (`orders.status = 'pending'`)
  - 결제 모듈 자리 (Strategy 패턴으로 추후 PG SDK만 끼우면 동작하도록 분리)
  - 테스트 결제 mock (개발 환경 한정)

## 6. 알림
- **트리거:** 주문 결제 완료 (`orders.status = 'paid'`)
- **채널:** 카카오 알림톡 (운영자 수신)
- **내용:** 주문번호, 상품명, 결제 금액, 구매자 정보
- **구현:** Supabase Database Webhook → Next.js API Route → 알림톡 발송 API (서비스 선정 예정: 알리고/솔라피 등)
- **재시도:** 발송 실패 시 큐에 적재, 운영자가 관리자 페이지에서 재발송 가능

## 7. 라이센스 발급
- 결제 완료 시 자동으로 라이센스 키 생성 → 사용자 마이페이지에 즉시 노출
- 라이센스 키는 `licenses` 테이블에서 관리 (만료일, 활성 상태, 키 값)
- 키 형식은 상품별로 다를 수 있음 (수동 등록 / 자동 생성 선택 가능)

## 8. 데이터 모델 (초안)
- `profiles` — id, email, name, phone, role, created_at
- `categories` — id, slug, name, sort_order
- `products` — id, slug, category_id, name, description, price, image_url, is_active
- `product_options` — id, product_id, name (e.g. 1년/평생), price, license_type
- `carts` / `cart_items`
- `orders` — id, user_id, status, total_amount, payment_method, paid_at
- `order_items` — id, order_id, product_option_id, quantity, price
- `licenses` — id, order_item_id, user_id, key, expires_at, is_active

## 9. 마일스톤
| 일정 | 작업 |
|---|---|
| ~ 2026-05-14 | 셋업, PRD/CLAUDE.md, 디자인 톤 확정 |
| ~ 2026-05-15 | 메인 / 상품 목록 / 상품 상세 |
| ~ 2026-05-16 | 인증 (소셜 포함), 장바구니, 주문서, 마이페이지 |
| 2026-05-17 | 관리자, 알림톡 mock, 배포(Vercel), 인수 테스트 |
| PG 승인 후 | 결제 모듈 연동, 실거래 테스트 |

## 10. 비기능 요구사항
- 모바일 우선 반응형
- 한국어 (ko-KR) 기본, 가격 단위 KRW
- Core Web Vitals 통과 — LCP < 2.5s
- 접근성: 라벨/버튼 시맨틱, 키보드 탐색 가능
