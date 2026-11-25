import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { createPeriodicRequestSchema, approvePeriodicRequestSchema, periodicRequestQuerySchema } from "./periodicMaintenance.validation";
import * as periodicService from "./periodicMaintenance.service";
import { prisma } from "../../config/db";

export const createPeriodicRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createPeriodicRequestSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid periodic maintenance request data.", parsed.error.flatten());

  const requester = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!requester) throw new ApiError(404, "ERR-107", "User not found.");

  const request = await periodicService.createPeriodicRequest(parsed.data, req.user!.userId, requester.department);
  res.status(201).json({ success: true, data: request, message: "Periodic maintenance request saved successfully." });
});

export const getPeriodicRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const request = await periodicService.getPeriodicRequestById(req.params.id, req.user!.userId, req.user!.isSystemAdmin);
  res.json({ success: true, data: request });
});

export const listPeriodicRequestsHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = periodicRequestQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid query parameters.", parsed.error.flatten());
  const result = await periodicService.listPeriodicRequests(parsed.data, req.user!.userId, req.user!.isSystemAdmin);
  res.json({ success: true, data: result });
});

export const approvePeriodicRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = approvePeriodicRequestSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid approval data.", parsed.error.flatten());
  const request = await periodicService.approvePeriodicRequest(req.params.id, parsed.data.level, parsed.data.status, req.user!.userId);
  res.json({ success: true, data: request, message: "Approval recorded successfully." });
});
