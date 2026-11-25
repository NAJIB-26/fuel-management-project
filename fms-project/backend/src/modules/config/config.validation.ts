import { z } from "zod";

export const upsertCompanySchema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().url().optional(),
  address: z.string().optional(),
  phones: z.array(z.string()).default([]),
});

export const createUnitSchema = z.object({
  description: z.string().min(1),
  status: z.enum(["ACTIVE", "SUSPENDED"]).default("ACTIVE"),
});
export const updateUnitSchema = createUnitSchema.partial();

export const createMaintenanceTypeSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["PERIODIC", "GENERAL"]),
});
export const updateMaintenanceTypeSchema = createMaintenanceTypeSchema.partial();

export const createFaultTypeSchema = z.object({ name: z.string().min(1) });

export const createVendorSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["FUEL_STATION", "WORKSHOP"]),
  address: z.string().optional(),
  phone: z.string().optional(),
});
export const updateVendorSchema = createVendorSchema.partial();
