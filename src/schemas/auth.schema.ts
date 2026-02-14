import * as z from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(3).max(30),
  username: z.string().trim().min(3).max(15),
  email: z.email().trim().toLowerCase(),
  password: z.string().trim().min(6),
});

export type RegisterBody = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().trim(),
});

export type LoginBody = z.infer<typeof loginSchema>;

export const requestResetPasswordSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

export type RequestResetPasswordBody = z.infer<
  typeof requestResetPasswordSchema
>;

export const resetPasswordSchema = z.object({
  newPassword: z.string().trim().min(6),
});

export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
