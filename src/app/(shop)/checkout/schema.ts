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
  payment_method: z.enum(["kakaopay", "naverpay", "card"], {
    message: "결제 수단을 선택하세요",
  }),
  agree_terms: z.literal(true, {
    message: "구매조건 확인 및 결제 진행 동의가 필요합니다",
  }),
  agree_privacy: z.literal(true, {
    message: "개인정보 제3자 제공 동의가 필요합니다",
  }),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
