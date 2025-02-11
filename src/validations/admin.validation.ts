// src/validations/admin.validation.ts
import { z } from "zod";

export const userFilterSchema = z.object({
  role: z.enum(["ADMIN", "CUSTOMER"]).optional(),
  isEmailVerified: z.boolean().optional(),
  isMfaEnabled: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const changeRoleSchema = z.object({
  role: z.enum(["ADMIN", "CUSTOMER"]),
});

export const adminActionSchema = z.object({
  reason: z.string().min(1, "Reason is required for admin actions"),
});
