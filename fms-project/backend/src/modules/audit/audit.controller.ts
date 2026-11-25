import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import * as auditService from "./audit.service";

const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  entityType: z.string().optional(),
});

export const listAuditLogsHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = auditQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid query parameters.", parsed.error.flatten());
  res.json({ success: true, data: await auditService.listAuditLogs(parsed.data) });
});
