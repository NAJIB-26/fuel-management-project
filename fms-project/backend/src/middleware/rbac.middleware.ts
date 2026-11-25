import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../config/db";

type PermissionKey = "canAdd" | "canEdit" | "canPrint" | "canViewReports" | "canApproveLevel1" | "canApproveLevel2";

export function requirePermission(...keys: PermissionKey[]) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new ApiError(401, "ERR-101", "Authentication required.");
    if (req.user.isSystemAdmin) return next();

    const permission = await prisma.permission.findUnique({ where: { userId: req.user.userId } });
    if (!permission) throw new ApiError(403, "ERR-201", "No permissions assigned.");

    const hasAll = keys.every((k) => permission[k] === true);
    if (!hasAll) throw new ApiError(403, "ERR-202", "Insufficient permissions for this action.");

    next();
  });
}

export function requireSystemAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.isSystemAdmin) {
    return next(new ApiError(403, "ERR-203", "System administrator access required."));
  }
  next();
}

export function requireScreen(screenKey: string) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new ApiError(401, "ERR-101", "Authentication required.");
    if (req.user.isSystemAdmin) return next();

    const permission = await prisma.permission.findUnique({ where: { userId: req.user.userId } });
    if (!permission) throw new ApiError(403, "ERR-201", "No permissions assigned.");

    const screenPermissions = (permission.screenPermissions as string[]) ?? [];
    if (!screenPermissions.includes(screenKey)) {
      throw new ApiError(403, "ERR-205", `Access to the "${screenKey}" screen is not permitted.`);
    }
    next();
  });
}

export function requireScreenAndPermission(screenKey: string, ...keys: PermissionKey[]) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new ApiError(401, "ERR-101", "Authentication required.");
    if (req.user.isSystemAdmin) return next();

    const permission = await prisma.permission.findUnique({ where: { userId: req.user.userId } });
    if (!permission) throw new ApiError(403, "ERR-201", "No permissions assigned.");

    const screenPermissions = (permission.screenPermissions as string[]) ?? [];
    if (!screenPermissions.includes(screenKey)) {
      throw new ApiError(403, "ERR-205", `Access to the "${screenKey}" screen is not permitted.`);
    }

    const hasAll = keys.every((k) => permission[k] === true);
    if (!hasAll) throw new ApiError(403, "ERR-202", "Insufficient permissions for this action.");

    next();
  });
}

export function scopeToOwner(req: Request): { requestedById: string } | Record<string, never> {
  if (req.user?.isSystemAdmin) return {};
  return { requestedById: req.user!.userId };
}
