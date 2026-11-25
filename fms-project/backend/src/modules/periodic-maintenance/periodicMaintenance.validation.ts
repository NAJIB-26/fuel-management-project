import { z } from "zod";

const kindEnum = z.enum([
  "ENGINE_OIL", "GEARBOX_OIL", "DIFFERENTIAL_OIL", "POWER_STEERING_OIL",
  "BRAKE_PAD", "OIL_FILTER", "DIESEL_FILTER", "DIESEL_FILTER_METAL",
  "AIR_FILTER", "RADIATOR_WATER", "TIRES", "WASHING", "PERIODIC_INSPECTION",
]);

export const createPeriodicRequestSchema = z.object({
  truckId: z.string().uuid(),
  kind: kindEnum,
  currentOdometer: z.number().nonnegative(),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  date: z.coerce.date().optional(),
});

export const approvePeriodicRequestSchema = z.object({
  level: z.enum(["L1", "L2"]),
  status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
});

export const periodicRequestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  approvalStatus: z.enum(["APPROVED", "REJECTED", "PENDING", "ALL"]).default("ALL"),
});
