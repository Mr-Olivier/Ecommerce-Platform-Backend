"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
// src/validations/auth.validation.ts
const zod_1 = require("zod");
const passwordValidation = zod_1.z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*]/, "Password must contain at least one special character");
const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
exports.registerSchema = zod_1.z
    .object({
    firstName: zod_1.z
        .string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must not exceed 50 characters")
        .trim(),
    lastName: zod_1.z
        .string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must not exceed 50 characters")
        .trim(),
    email: zod_1.z
        .string()
        .email("Invalid email format")
        .min(1, "Email is required")
        .toLowerCase(),
    phoneNumber: zod_1.z.string().regex(phoneRegex, "Invalid phone number format"),
    password: passwordValidation,
    confirmPassword: zod_1.z.string().min(1, "Password confirmation is required"),
    role: zod_1.z.enum(["ADMIN", "CUSTOMER"], {
        errorMap: () => ({ message: "Role must be either ADMIN or CUSTOMER" }),
    }),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email("Invalid email format")
        .min(1, "Email is required")
        .toLowerCase(),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, "Current password is required"),
    newPassword: passwordValidation,
})
    .superRefine((data, ctx) => {
    if (data.currentPassword === data.newPassword) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "New password must be different from current password",
            path: ["newPassword"],
        });
    }
});
