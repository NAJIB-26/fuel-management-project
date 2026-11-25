import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as dashboardService from "./dashboard.service";

export const getDashboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await dashboardService.getDashboardSummary({
    requesterId: req.user!.userId,
    isAdmin: req.user!.isSystemAdmin,
  });
  res.json({ success: true, data });
});
