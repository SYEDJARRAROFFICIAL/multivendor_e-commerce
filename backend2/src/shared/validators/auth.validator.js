import { z } from "zod";

const registerSchema = z.object({
  userName: z
    .string("Name must be a string")
    .min(3, "Name must be at least 3 characters long"),
  userEmail: z.email("Invalid email"),
  userPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[@#$!%*?&-_]/,
      "Password must contain at least one special character (@,#, $, !, %, *, ?, &, -, _)"
    ),
  userRole: z
    .enum(["buyer", "store-admin", "factory-admin"])
    .default("buyer")
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^(\+92|0)?3[0-9]{9}$/, "Invalid Pakistani phone number format"),
});

const loginSchema = z.object({
  userEmail: z.email("Invalid email"),
  userPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});

const resetPasswordSchema = z.object({
  userPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});

export { registerSchema, loginSchema, resetPasswordSchema };
