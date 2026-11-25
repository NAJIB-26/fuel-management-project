import { z } from "zod";

export const createGeneralRequestSchema = z.object({
  truckId: z.string().uuid(),
  currentOdometer: z.number().nonnegative(),
  faultType: z.string().min(1),
  faultDescription: z.string().min(1),
  estimatedCost: z.number().nonnegative(),
  requiredParts: z.string().optional(),
  date: z.coerce.date().optional(),
  attachmentUrl: z.string().url().optional(),
});

export const approveGeneralRequestSchema = z.object({
  level: z.enum(["L1", "L2"]),
  status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
});

export const generalRequestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  approvalStatus: z.enum(["APPROVED", "REJECTED", "PENDING", "ALL"]).default("ALL"),
});
