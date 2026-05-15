import { z } from "zod";

// 한국어 사용자 친화 메시지로 통일.
const emailField = z
  .string()
  .trim()
  .min(1, "이메일을 입력하세요")
  .email("올바른 이메일 형식이 아닙니다");

const passwordField = z
  .string()
  .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
  .max(72, "비밀번호가 너무 깁니다");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "비밀번호를 입력하세요"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: emailField,
    password: passwordField,
    passwordConfirm: z.string(),
    agreeTerms: z.literal(true, {
      message: "이용약관 동의가 필요합니다",
    }),
    agreePrivacy: z.literal(true, {
      message: "개인정보처리방침 동의가 필요합니다",
    }),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });
export type SignupValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
