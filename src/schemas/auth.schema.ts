import * as z from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(30, "Name must be at most 30 characters"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(15, "Username must be at most 15 characters"),
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$:%^&*]/,
      "Password must contain at least one special character"
    ),
  bio: z
    .string()
    .trim()
    .max(160, "Bio must be at most 160 characters")
    .optional(),
});

export type RegisterBody = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().trim(),
});

export type LoginBody = z.infer<typeof loginSchema>;

export const requestResetPasswordSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
});

export type RequestResetPasswordBody = z.infer<
  typeof requestResetPasswordSchema
>;

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .trim()
    .min(6, "New password must be at least 6 characters"),
});

export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
