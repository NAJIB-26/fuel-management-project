import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { createFuelRequestSchema, approveFuelRequestSchema, fuelRequestQuerySchema } from "./fuelRequest.validation";
import * as fuelService from "./fuelRequest.service";
import { prisma } from "../../config/db";

export const createFuelRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createFuelRequestSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid fuel request data.", parsed.error.flatten());

  const requester = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!requester) throw new ApiError(404, "ERR-107", "User not found.");

  const request = await fuelService.createFuelRequest(parsed.data, req.user!.userId, requester.department);
  res.status(201).json({ success: true, data: request, message: "Fuel request saved successfully." });
});

export const getFuelRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const request = await fuelService.getFuelRequestById(req.params.id, req.user!.userId, req.user!.isSystemAdmin);
  res.json({ success: true, data: request });
});

export const listFuelRequestsHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = fuelRequestQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid query parameters.", parsed.error.flatten());
  const result = await fuelService.listFuelRequests(parsed.data, req.user!.userId, req.user!.isSystemAdmin);
  res.json({ success: true, data: result });
});

export const approveFuelRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = approveFuelRequestSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid approval data.", parsed.error.flatten());
  const request = await fuelService.approveFuelRequest(req.params.id, parsed.data.level, parsed.data.status, req.user!.userId);
  res.json({ success: true, data: request, message: "Approval recorded successfully." });
});
