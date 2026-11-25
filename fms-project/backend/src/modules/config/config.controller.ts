import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import * as configService from "./config.service";
import {
  upsertCompanySchema, createUnitSchema, updateUnitSchema,
  createMaintenanceTypeSchema, createFaultTypeSchema, createVendorSchema, updateVendorSchema,
} from "./config.validation";

// Company
export const getCompanyHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await configService.getCompany() });
});
export const upsertCompanyHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = upsertCompanySchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid company data.", parsed.error.flatten());
  const company = await configService.upsertCompany(parsed.data, req.user!.userId);
  res.json({ success: true, data: company, message: "Company settings saved successfully." });
});

// Units
export const listUnitsHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await configService.listUnits() });
});
export const createUnitHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createUnitSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid unit data.", parsed.error.flatten());
  const unit = await configService.createUnit(parsed.data, req.user!.userId);
  res.status(201).json({ success: true, data: unit, message: "Unit saved successfully." });
});
export const updateUnitHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateUnitSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid unit data.", parsed.error.flatten());
  const unit = await configService.updateUnit(req.params.id, parsed.data, req.user!.userId);
  res.json({ success: true, data: unit, message: "Unit updated successfully." });
});

// Maintenance / Fault type codes
export const listMaintenanceTypesHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await configService.listMaintenanceTypes() });
});
export const createMaintenanceTypeHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createMaintenanceTypeSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid maintenance type data.", parsed.error.flatten());
  const item = await configService.createMaintenanceType(parsed.data, req.user!.userId);
  res.status(201).json({ success: true, data: item, message: "Maintenance type saved successfully." });
});
export const listFaultTypesHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await configService.listFaultTypes() });
});
export const createFaultTypeHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createFaultTypeSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid fault type data.", parsed.error.flatten());
  const item = await configService.createFaultType(parsed.data.name, req.user!.userId);
  res.status(201).json({ success: true, data: item, message: "Fault type saved successfully." });
});

// Vendors
export const listVendorsHandler = asyncHandler(async (req: Request, res: Response) => {
  const type = req.query.type as "FUEL_STATION" | "WORKSHOP" | undefined;
  res.json({ success: true, data: await configService.listVendors(type) });
});
export const createVendorHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createVendorSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid vendor data.", parsed.error.flatten());
  const vendor = await configService.createVendor(parsed.data, req.user!.userId);
  res.status(201).json({ success: true, data: vendor, message: "Vendor saved successfully." });
});

// Error codes
export const listErrorCodesHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await configService.listErrorCodes() });
});
