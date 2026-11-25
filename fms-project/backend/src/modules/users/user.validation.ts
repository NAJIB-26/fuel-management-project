import { z } from "zod";

export const createUserSchema = z.object({
  employeeNo: z.number().int().positive().optional(),
  fullName: z.string().min(1),
  jobLevel: z.string().min(1),
  department: z.string().min(1),
  status: z.enum(["ACTIVE", "SUSPENDED"]).default("ACTIVE"),
  username: z.string().min(3),
  password: z.string().min(8),
  managedById: z.string().uuid().optional(),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  jobLevel: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  managedById: z.string().uuid().nullable().optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
});
