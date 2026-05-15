# CLAUDE.md

이 파일은 Claude Code가 작업 시 자동 참조하는 컨텍스트 문서다.
프로젝트 전반의 컨텍스트는 `PRD.md`에 있으며, 본 문서는 **코드 작성 규칙**에 집중한다.

## 프로젝트 한 줄 요약
AI 소프트웨어 라이센스 판매 쇼핑몰 — Next.js 14 (App Router) + Supabase + Vercel. 참고: ssolasoft.com.

## 디렉토리 구조
```
gpt-mall/
├── src/
│   ├── app/                    # Next.js App Router (라우트별 폴더)
│   │   ├── (shop)/             # 일반 사용자 영역 (라우트 그룹)
│   │   │   ├── page.tsx        # 메인
│   │   │   ├── products/       # 상품 목록·상세
│   │   │   ├── cart/           # 장바구니
│   │   │   ├── checkout/       # 주문서·완료
│   │   │   └── account/        # 마이페이지
│   │   ├── admin/              # 관리자 (미들웨어로 권한 체크)
│   │   ├── auth/               # 로그인·OAuth 콜백
│   │   ├── api/                # Route Handlers (웹훅, 알림톡 등)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # 버튼·인풋 등 원자 컴포넌트
│   │   └── shop/               # 도메인 컴포넌트 (ProductCard 등)
│   ├── lib/
│   │   ├── supabase/           # 클라이언트/서버/미들웨어 클라이언트 분리
│   │   │   ├── client.ts       # 브라우저용
│   │   │   ├── server.ts       # 서버 컴포넌트·Route Handler용
│   │   │   └── middleware.ts   # 미들웨어용 (쿠키 갱신)
│   │   ├── utils.ts            # cn() 등 공통 유틸
│   │   └── constants.ts        # 상수
│   ├── types/                  # DB 타입, 도메인 타입
│   └── middleware.ts           # 인증/권한 미들웨어
├── public/
├── PRD.md
└── CLAUDE.md
```

## 코드 규칙 (반드시 지킬 것)

### 1. 서버 컴포넌트 우선
- 모든 컴포넌트는 **기본적으로 서버 컴포넌트**로 작성.
- `useState` / `useEffect` / 이벤트 핸들러가 꼭 필요할 때만 파일 최상단에 `'use client'` 명시.
- 데이터 페칭은 서버 컴포넌트에서 직접 `await`. SWR/React Query는 클라이언트 인터랙션이 있는 경우에만.

### 2. 모든 비동기 호출은 try-catch
- Supabase, fetch, 외부 API 호출은 예외 없이 try-catch로 감싼다.
- catch 블록에서는 최소한 `console.error` + 사용자에게 보여줄 fallback 처리.
- Route Handler에서는 에러 시 `NextResponse.json({ error }, { status: 500 })` 반환.

```ts
// 예시: 서버 컴포넌트에서 상품 조회
try {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  // 정상 처리
} catch (e) {
  console.error('[products] 조회 실패', e);
  // fallback UI
}
```

### 3. 한국어 주석
- 코드 주석은 **한국어**로 작성. 영문 식별자는 유지하되 설명은 한국어.
- 단, 주석은 _WHY_ 가 분명할 때만 — 코드만 봐도 알 수 있는 것은 주석하지 않는다.

### 4. 타입 안전성
- `any` 금지. 불가피하면 `unknown` 후 좁히기.
- DB 타입은 `src/types/database.ts`에 Supabase CLI로 생성된 타입 사용.

### 5. className 머지
- 조건부 className은 `cn()` 유틸 사용 (`clsx` + `tailwind-merge` 조합).
```ts
import { cn } from '@/lib/utils';
<button className={cn('px-4 py-2', isPrimary && 'bg-blue-500')} />
```

### 6. Supabase 클라이언트 사용처별 분리
- 서버 컴포넌트·Route Handler → `@/lib/supabase/server`
- 클라이언트 컴포넌트 → `@/lib/supabase/client`
- 미들웨어 → `@/lib/supabase/middleware`
- 절대 클라이언트용 키를 서버 코드에 쓰지 않고, service role 키를 클라이언트로 노출하지 않는다.

### 7. 환경변수
- 공개: `NEXT_PUBLIC_*` 접두사
- 비공개(예: `SUPABASE_SERVICE_ROLE_KEY`)는 서버 코드에서만 접근
- 로컬 값은 `.env.local` (gitignored)

## 사용 라이브러리
| 용도 | 라이브러리 |
|---|---|
| Framework | `next@14` (App Router) |
| Language | `typescript@5` |
| Styling | `tailwindcss@3` |
| Backend / Auth | `@supabase/supabase-js`, `@supabase/ssr` |
| 아이콘 | `lucide-react` |
| className 머지 | `clsx`, `tailwind-merge` |

## 작업 워크플로
- 새 페이지 만들 때: `src/app/<route>/page.tsx` 생성, 서버 컴포넌트 기본.
- 새 컴포넌트: 우선 `src/components/shop/` 또는 `src/components/ui/` 중 적절한 위치 결정.
- DB 스키마 변경: `supabase/migrations/`에 SQL 추가 후 타입 재생성.
- 커밋 메시지: 한국어 제목 + 영문 prefix (`feat:`, `fix:`, `refactor:` 등).

## 페이지 라우트
페이지 목록과 인증·결제·알림 사양은 `PRD.md` 3~6장을 참조.

## 납기
**2026-05-17.** 마일스톤은 `PRD.md` §9 참조.
