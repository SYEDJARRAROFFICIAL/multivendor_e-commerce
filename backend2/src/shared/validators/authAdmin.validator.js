import { z } from "zod";

const registerSchema = z.object({
  adminName: z
    .string("Name must be a string")
    .min(3, "Name must be at least 3 characters long"),
  adminEmail: z.email("Invalid email"),
  adminPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[@#$!%*?&-_]/,
      "Password must contain at least one special character (@,#, $, !, %, *, ?, &, -, _)"
    ),
  adminRole: z
    .enum([
      "superAdmin",
      "analystAdmin",
      "factoryAdmin",
      "storeAdmin",
      "buyerAdmin",
    ])
    .default("superAdmin")
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^(\+92|0)?3[0-9]{9}$/, "Invalid Pakistani phone number format"),
});

const loginSchema = z.object({
  adminEmail: z.email("Invalid email"),
  adminPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});

const resetPasswordSchema = z.object({
  adminPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});

export { registerSchema, loginSchema, resetPasswordSchema };
