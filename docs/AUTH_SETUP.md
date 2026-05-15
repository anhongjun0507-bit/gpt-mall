# 인증 셋업

## 1. 환경 변수

`.env.local` (로컬) + Vercel project env (배포):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://rrgsbbwkafvkqwnodmir.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # 서버 코드 전용
NEXT_PUBLIC_SITE_URL=https://digitalst.kr          # 이메일 redirectTo 베이스 (개발: http://localhost:3000)
```

## 2. Supabase Auth 설정 (Dashboard)

### 2.1. Site URL + Redirect URLs
이미 Management API로 자동 설정됨:
- Site URL: `https://digitalst.kr`
- Redirect URL 화이트리스트:
  - `http://localhost:3000/**` (로컬 개발)
  - `https://digitalst.kr/**` · `https://www.digitalst.kr/**` (정식 도메인)
  - `https://gpt-mall.vercel.app/**` (임시 alias, 유지)
  - `https://*-hyunseoks-projects-511caaf3.vercel.app/**` (Vercel preview)

확인: Dashboard > Authentication > URL Configuration

### 2.2. 이메일 템플릿 한국어화 (권장)
Dashboard > Authentication > Email Templates 에서 각 템플릿 본문을 한국어로 교체.

#### Confirm signup (회원가입 인증)
**Subject:** `[디지털스토어] 이메일 인증을 완료해주세요`

**Body (HTML):**
```html
<h2>디지털스토어 에 오신 것을 환영합니다</h2>
<p>아래 버튼을 클릭하시면 이메일 인증이 완료됩니다.</p>
<p>
  <a href="{{ .ConfirmationURL }}"
     style="display:inline-block;background:#0A0A0A;color:#FAFAFA;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
    이메일 인증하기
  </a>
</p>
<p style="color:#737373;font-size:12px;">
  이 메일은 디지털스토어 회원가입 인증을 위해 발송되었습니다. 본인이 가입하지 않으셨다면 무시하셔도 됩니다.
</p>
```

#### Reset password (비밀번호 재설정)
**Subject:** `[디지털스토어] 비밀번호 재설정`

```html
<h2>비밀번호 재설정</h2>
<p>아래 버튼을 클릭해 새 비밀번호를 설정해주세요. 이 링크는 60분간 유효합니다.</p>
<p>
  <a href="{{ .ConfirmationURL }}"
     style="display:inline-block;background:#C9A961;color:#0A0A0A;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
    비밀번호 재설정하기
  </a>
</p>
```

#### Magic Link (옵션)
필요 시 동일한 톤으로.

## 3. 카카오 OAuth 활성화

코드는 이미 깔려 있습니다 (`SocialButtons.tsx`). 아래 단계만 거치면 카카오 버튼이 작동합니다.

### 3.1. 카카오 개발자센터 앱 생성
1. https://developers.kakao.com → 내 애플리케이션 → **앱 추가**
2. 앱 이름: `디지털스토어`, 회사명: 임의
3. 생성 후 **요약 정보** 페이지에서 다음 값 확인:
   - **REST API 키** (카카오에서는 이 값을 Client ID 로 사용)
4. 좌측 메뉴 **앱 키** → **REST API 키** 그대로
5. **카카오 로그인** 메뉴 활성화:
   - 활성화 설정: ON
   - **Redirect URI** 추가:
     ```
     https://rrgsbbwkafvkqwnodmir.supabase.co/auth/v1/callback
     ```
     ※ 이 URL 은 Supabase 가 카카오로부터 토큰을 받는 콜백. 우리 앱의 `/auth/callback` 과 다름.
6. **동의 항목** 메뉴:
   - 이메일 (필수)
   - 닉네임 (선택)
   - 카카오 로그인 사용 시 이메일이 필수여야 Supabase 가 user 를 만들 수 있음
7. **보안** 메뉴 → **Client Secret** 생성 → 값 복사 (사용 함, ON 설정)

### 3.2. Supabase 에 카카오 키 입력
1. Supabase Dashboard > Authentication > **Providers** > Kakao
2. **Enable Sign in with Kakao** 토글 ON
3. **Kakao Client ID**: 위에서 받은 REST API 키
4. **Kakao Client Secret**: Client Secret 값
5. Save

이후 카카오 버튼 클릭 → 카카오 로그인 페이지 → 동의 → `/auth/callback` → 자동 로그인.

### 3.3. 키 발급 전 동작
키 등록 전에 카카오 버튼을 클릭하면 친절한 에러 toast 가 뜸 ("카카오 로그인이 아직 활성화되지 않았어요"). 사용자는 우선 이메일로 가입하면 됨.

## 4. 네이버 OAuth (향후 작업)

Supabase 의 `signInWithOAuth` 가 네이버를 기본 지원하지 않음. 옵션:
1. **커스텀 OAuth 라우트 구현** — `/auth/naver/start` (네이버 인증 페이지로 리다이렉트) + `/auth/naver/callback` (코드 교환 → 사용자 생성 → Supabase 세션 발급)
2. **Auth.js (NextAuth)** 같은 별도 라이브러리 도입

권장은 옵션 1. 네이버 키 발급 후 진행 가능. 현재는 버튼이 "준비 중" toast 표시.

네이버 키 발급 절차 메모:
- https://developers.naver.com → Application 등록
- 사용 API: **네이버 로그인**
- 서비스 URL: `https://digitalst.kr`
- 콜백 URL: `https://digitalst.kr/auth/naver/callback`
- 검수 필요 (실제 운영 시) — 개발 단계는 검수 없이 테스트 가능

## 5. 인증 흐름 다이어그램

```
[이메일 회원가입]
  /signup → Server Action signUpWithEmail
        → supabase.auth.signUp(emailRedirectTo: /auth/callback?next=/account)
        → redirect /verify

  이메일 수신 → 링크 클릭
        → /auth/callback?code=...
        → exchangeCodeForSession
        → redirect /account ✓

[비밀번호 재설정]
  /forgot-password → requestPasswordReset
        → supabase.auth.resetPasswordForEmail(redirectTo: /auth/callback?next=/reset-password)
  메일 → /auth/callback → 세션 발급 → /reset-password
        → updatePassword → /login?reset=1 ✓

[카카오 OAuth]
  /login → 카카오 버튼 → supabase.auth.signInWithOAuth(provider:'kakao', redirectTo: /auth/callback?next=/)
        → 카카오 로그인 → Supabase 콜백 → /auth/callback ✓

[로그아웃]
  Header DropdownMenu → form POST /auth/signout
        → supabase.auth.signOut → redirect / ✓
```

## 6. admin 권한 부여

신규 가입자는 기본 `role='customer'`. admin 으로 승격:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = '대상@example.com');
```

본인이 본인의 role 을 바꾸는 건 트리거 `prevent_role_self_change` 가 차단. 기존 admin 이 다른 사용자를 승격해야 함.
