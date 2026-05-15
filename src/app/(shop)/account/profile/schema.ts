import { z } from "zod";

export const profileSchema = z.object({
  display_name: z
    .string()
    .min(1, "이름을 입력해주세요")
    .max(40, "이름은 40자 이내로 입력해주세요"),
  phone: z
    .string()
    .min(1, "휴대전화를 입력해주세요")
    .regex(
      /^01\d-?\d{3,4}-?\d{4}$/,
      "올바른 휴대전화 형식이 아니에요 (예: 010-1234-5678)"
    ),
});

export type ProfileValues = z.infer<typeof profileSchema>;
