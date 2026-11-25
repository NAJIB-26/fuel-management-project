import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { updatePermissionSchema } from "./permission.validation";
import * as permissionService from "./permission.service";

export const getPermissionHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await permissionService.getPermissionByUserId(req.params.userId) });
});

export const updatePermissionHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updatePermissionSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid permission data.", parsed.error.flatten());
  const permission = await permissionService.updatePermission(req.params.userId, parsed.data, req.user!.userId);
  res.json({ success: true, data: permission, message: "Permissions updated successfully." });
});

export const searchUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.query.q as string) || "";
  res.json({ success: true, data: await permissionService.searchUsersForPermissionAssign(q) });
});
