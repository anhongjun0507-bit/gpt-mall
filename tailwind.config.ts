import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Typography ───────────────────────────────────────────
      fontFamily: {
        // Pretendard Variable 우선, 시스템 폴백
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "sans-serif",
        ],
      },
      // 반응형 타이포 atomic 토큰 — 시맨틱 유틸(.text-display 등)이 내부적으로 참조
      fontSize: {
        "display-sm": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "display-md": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.035em" }],
        "display-lg": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
        "h2-sm": ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "h2-md": ["2.25rem", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
      },

      // ─── Colors ───────────────────────────────────────────────
      // shadcn CSS 변수와 충돌 없도록 var(--*) 통일
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          // 프리미엄 골드 액센트
          gold: "var(--accent-gold)",
          "gold-hover": "var(--accent-gold-hover)",
          "gold-faint": "var(--accent-gold-faint)",  // 옅은 그라데이션/표면용
          // 텍스트 전용 골드 — 라이트 배경 위 가독성(AA 4.5+) 충족하는 어두운 골드.
          "gold-text": "var(--accent-gold-text)",
          // 다크 배경 위 골드 텍스트(footer / 최종 CTA 섹션 내부 등).
          "gold-on-dark": "var(--accent-gold-on-dark)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        // Header backdrop — bg-header-bg 로 직접 사용
        "header-bg": "var(--header-bg)",

        // Footer — 모드 독립 (라이트/다크 모두 동일). bg-footer-bg / text-footer-foreground
        "footer-bg": "var(--footer-bg)",
        "footer-foreground": "var(--footer-foreground)",
      },

      // ─── Geometry ─────────────────────────────────────────────
      borderRadius: {
        lg: "var(--radius)",                       // 1rem  — 기본 라운드
        md: "calc(var(--radius) - 4px)",           // 12px  — 버튼/인풋
        sm: "calc(var(--radius) - 8px)",           // 8px   — 배지
        "2xl": "var(--radius)",                    // 1rem  — 카드 표준
        "3xl": "calc(var(--radius) + 8px)",        // 1.5rem — 큰 컨테이너
      },

      // ─── Shadows ──────────────────────────────────────────────
      // 프리미엄 룩의 핵심: 채도 낮은 옅은 그림자
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.04)",                              // 카드 hover 등 미세 lift
        DEFAULT: "0 2px 6px -1px rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        lg: "0 12px 40px -12px rgb(0 0 0 / 0.12)",                         // 모달/드롭다운 — 부드럽고 wide
        xl: "0 24px 60px -16px rgb(0 0 0 / 0.18)",                         // 헤로/CTA 카드
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
