import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { createGeneralRequestSchema, approveGeneralRequestSchema, generalRequestQuerySchema } from "./generalMaintenance.validation";
import * as generalService from "./generalMaintenance.service";
import { prisma } from "../../config/db";

export const createGeneralRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createGeneralRequestSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid general maintenance request data.", parsed.error.flatten());

  const requester = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!requester) throw new ApiError(404, "ERR-107", "User not found.");

  const request = await generalService.createGeneralRequest(parsed.data, req.user!.userId, requester.department);
  res.status(201).json({ success: true, data: request, message: "General maintenance request saved successfully." });
});

export const getGeneralRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const request = await generalService.getGeneralRequestById(req.params.id, req.user!.userId, req.user!.isSystemAdmin);
  res.json({ success: true, data: request });
});

export const listGeneralRequestsHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = generalRequestQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid query parameters.", parsed.error.flatten());
  const result = await generalService.listGeneralRequests(parsed.data, req.user!.userId, req.user!.isSystemAdmin);
  res.json({ success: true, data: result });
});

export const approveGeneralRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = approveGeneralRequestSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid approval data.", parsed.error.flatten());
  const request = await generalService.approveGeneralRequest(req.params.id, parsed.data.level, parsed.data.status, req.user!.userId);
  res.json({ success: true, data: request, message: "Approval recorded successfully." });
});
