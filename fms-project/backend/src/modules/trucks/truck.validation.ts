import { z } from "zod";

const maintenanceLimitSchema = z.object({
  kind: z.enum([
    "ENGINE_OIL", "GEARBOX_OIL", "DIFFERENTIAL_OIL", "POWER_STEERING_OIL",
    "BRAKE_PAD", "OIL_FILTER", "DIESEL_FILTER", "DIESEL_FILTER_METAL",
    "AIR_FILTER", "RADIATOR_WATER", "TIRES", "WASHING", "PERIODIC_INSPECTION",
  ]),
  limitKm: z.number().positive(),
});

export const createTruckSchema = z.object({
  name: z.string().min(1),
  model: z.string().min(1),
  yearMade: z.number().int().min(1980).max(new Date().getFullYear() + 1),
  plateNo: z.string().min(1),
  tankCapacityLiters: z.number().positive(),
  fuelType: z.enum(["GASOLINE", "DIESEL"]),
  engineOilType: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(["ACTIVE", "IN_MAINTENANCE", "SOLD"]).default("ACTIVE"),
  insuranceExpiry: z.coerce.date().optional(),
  licenseExpiry: z.coerce.date().optional(),
  maintenanceLimits: z.array(maintenanceLimitSchema).optional(),
});

export const updateTruckSchema = createTruckSchema.partial();

export const truckQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  status: z.enum(["ACTIVE", "IN_MAINTENANCE", "SOLD"]).optional(),
  search: z.string().optional(),
});
