import { z } from "zod";

const registerSchema = z.object({
  userFullName: z
    .string({ message: "Full name must be a string" })
    .min(3, "Full name must be at least 3 characters long")
    .max(50, "Full name cannot exceed 50 characters"),

  userName: z
    .string({ message: "Username must be a string" })
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Username can only contain lowercase letters, numbers, and underscores"
    )
    .optional(), // ✅ Make it optional since model auto-generates

  userEmail: z
    .string({ message: "Email must be a string" })
    .email("Invalid email address")
    .max(100, "Email cannot exceed 100 characters"),

  userPassword: z
    .string({ message: "Password must be a string" })
    .min(6, "Password must be at least 6 characters long")
    .max(255, "Password cannot exceed 255 characters"),

  userRole: z
    .enum(["buyer", "store-admin", "factory-admin", "admin"])
    .default("buyer")
    .optional(),

  phoneNumber: z
    .string({ message: "Phone number must be a string" })
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number cannot exceed 20 digits")
    .regex(/^\+?[0-9\s\-\(\)]+$/, "Invalid phone number format"),

  userAddress: z
    .string({ message: "Address must be a string" })
    .max(200, "Address cannot exceed 200 characters")
    .optional(),
});

export { registerSchema };

// import { z } from "zod";

// const registerSchema = z.object({
//     name: z.string("Name must be a string").min(3, "Name must be at least 3 characters long"),
//     email: z.email("Invalid email"),
//     password: z.string().min(6, "Password must be at least 6 characters long"),
//     role: z.enum(["buyers", "store", "factory"]).default("buyers").optional()
// })

// export { registerSchema }
