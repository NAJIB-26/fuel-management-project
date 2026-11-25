import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { loginSchema, changePasswordSchema } from "./auth.validation";
import * as authService from "./auth.service";
import { ApiError } from "../../utils/ApiError";

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid login data.", parsed.error.flatten());
  const result = await authService.login(parsed.data.username, parsed.data.password);
  res.json({ success: true, data: result });
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, "ERR-002", "Refresh token required.");
  const accessToken = await authService.refresh(refreshToken);
  res.json({ success: true, data: { accessToken } });
});

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-003", "Invalid password change data.", parsed.error.flatten());
  await authService.changePassword(parsed.data.username, parsed.data.oldPassword, parsed.data.newPassword);
  res.json({ success: true, message: "Password updated successfully." });
});

export const getMeHandler = asyncHandler(async (req: Request, res: Response) => {
  const me = await authService.getMe(req.user!.userId);
  res.json({ success: true, data: me });
});
