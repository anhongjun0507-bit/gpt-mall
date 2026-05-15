import { z } from "zod";

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
    newPassword: z
      .string()
      .min(8, "새 비밀번호는 8자 이상이어야 합니다")
      .max(72, "비밀번호가 너무 깁니다"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "비밀번호가 일치하지 않아요",
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ["newPassword"],
    message: "현재 비밀번호와 동일해요",
  });

export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
