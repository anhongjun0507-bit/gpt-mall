import { z } from "zod";

// 한국 휴대전화 패턴 — 하이픈 유무 모두 허용 (폼에서 자동 포맷).
const phoneRegex = /^010-?\d{4}-?\d{4}$/;

export const checkoutSchema = z.object({
  recipient_name: z
    .string()
    .trim()
    .min(1, "이름을 입력하세요")
    .max(50, "이름이 너무 깁니다"),
  recipient_phone: z
    .string()
    .trim()
    .regex(phoneRegex, "010-XXXX-XXXX 형식으로 입력하세요"),
  // 카카오톡 ID — 선택 항목. 빈 문자열은 허용.
  kakao_id: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal("")),
  // 요청사항 — 선택, 500자 제한.
  memo: z
    .string()
    .trim()
    .max(500, "요청사항이 너무 깁니다")
    .optional()
    .or(z.literal("")),
  // UI 노출 수단만 검증 (naverpay 는 기존 주문 호환용 — 신규 결제에는 사용 X)
  // 현재 실제 선택 가능한 값은 bank_transfer 뿐 — 카드/간편결제는 가맹 승인 대기.
  payment_method: z.enum(["bank_transfer", "kakaopay", "card"], {
    message: "결제 수단을 선택하세요",
  }),
  // 입금자명 — 무통장 입금일 때만 필수 (아래 superRefine).
  depositor_name: z
    .string()
    .trim()
    .max(30, "입금자명이 너무 깁니다")
    .optional()
    .or(z.literal("")),
  agree_terms: z.literal(true, {
    message: "구매조건 확인 및 결제 진행 동의가 필요합니다",
  }),
  agree_privacy: z.literal(true, {
    message: "개인정보 제3자 제공 동의가 필요합니다",
  }),
}).superRefine((v, ctx) => {
  // 입금자명은 무통장 입금에서만 필수 — 다른 수단에서는 아예 받지 않는다.
  if (v.payment_method === "bank_transfer" && !v.depositor_name?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["depositor_name"],
      message: "입금자명을 입력하세요",
    });
  }
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
