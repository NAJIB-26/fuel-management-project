import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const changePasswordSchema = z
  .object({
    username: z.string().min(1),
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
