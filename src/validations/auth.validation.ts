// // src/validations/auth.validation.ts
// import { z } from "zod";

// const passwordValidation = z
//   .string()
//   .min(8, "Password must be at least 8 characters")
//   .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
//   .regex(/[0-9]/, "Password must contain at least one number")
//   .regex(/[!@#$%^&*]/, "Password must contain at least one special character");

// const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

// export const registerSchema = z
//   .object({
//     firstName: z
//       .string()
//       .min(2, "First name must be at least 2 characters")
//       .max(50, "First name must not exceed 50 characters")
//       .trim(),
//     lastName: z
//       .string()
//       .min(2, "Last name must be at least 2 characters")
//       .max(50, "Last name must not exceed 50 characters")
//       .trim(),
//     email: z
//       .string()
//       .email("Invalid email format")
//       .min(1, "Email is required")
//       .toLowerCase(),
//     phoneNumber: z.string().regex(phoneRegex, "Invalid phone number format"),
//     password: passwordValidation,
//     confirmPassword: z.string().min(1, "Password confirmation is required"),
//     role: z.enum(["ADMIN", "CUSTOMER"], {
//       errorMap: () => ({ message: "Role must be either ADMIN or CUSTOMER" }),
//     }),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

// export const loginSchema = z.object({
//   email: z
//     .string()
//     .email("Invalid email format")
//     .min(1, "Email is required")
//     .toLowerCase(),
//   password: z.string().min(1, "Password is required"),
// });

// export const changePasswordSchema = z
//   .object({
//     currentPassword: z.string().min(1, "Current password is required"),
//     newPassword: passwordValidation,
//   })
//   .superRefine((data, ctx) => {
//     if (data.currentPassword === data.newPassword) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "New password must be different from current password",
//         path: ["newPassword"],
//       });
//     }
//   });

// src/validations/auth.validation.ts
import { z } from "zod";

const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*]/, "Password must contain at least one special character");

const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must not exceed 50 characters")
      .trim(),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters")
      .trim(),
    email: z.string().email("Invalid email format").toLowerCase(),
    phoneNumber: z.string().regex(phoneRegex, "Invalid phone number format"),
    password: passwordValidation,
    confirmPassword: z.string(),
    role: z.enum(["ADMIN", "CUSTOMER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .trim()
    .optional(),
  phoneNumber: z
    .string()
    .regex(phoneRegex, "Invalid phone number format")
    .optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const mfaVerificationSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});
