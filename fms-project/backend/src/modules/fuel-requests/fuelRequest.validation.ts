import { z } from "zod";

export const createFuelRequestSchema = z.object({
  truckId: z.string().uuid(),
  fuelType: z.enum(["GASOLINE", "DIESEL"]),
  requestedQuantity: z.number().positive(),
  unit: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  currentOdometer: z.number().nonnegative(),
  date: z.coerce.date().optional(),
  attachmentUrl: z.string().url().optional(),
});

export const approveFuelRequestSchema = z.object({
  level: z.enum(["DIRECT", "SERVICE"]),
  status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
});

export const fuelRequestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  approvalStatus: z.enum(["APPROVED", "REJECTED", "PENDING", "ALL"]).default("ALL"),
});
