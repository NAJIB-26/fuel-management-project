import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import * as notificationService from "./notification.service";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.coerce.boolean().default(false),
});

const deviceTokenSchema = z.object({ token: z.string().min(10), platform: z.enum(["android", "ios"]).optional() });
const unregisterSchema = z.object({ token: z.string().min(10) });

export const listNotificationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid query parameters.", parsed.error.flatten());
  const result = await notificationService.listNotifications(req.user!.userId, parsed.data.page, parsed.data.pageSize, parsed.data.unreadOnly);
  res.json({ success: true, data: result });
});

export const markReadHandler = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user!.userId);
  res.json({ success: true, data: notification });
});

export const markAllReadHandler = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.user!.userId);
  res.json({ success: true, message: "تم تعليم جميع الإشعارات كمقروءة." });
});

export const registerDeviceHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = deviceTokenSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid device token data.", parsed.error.flatten());
  await notificationService.registerDeviceToken(req.user!.userId, parsed.data.token, parsed.data.platform || "android");
  res.json({ success: true, message: "تم تسجيل الجهاز لاستقبال الإشعارات." });
});

export const unregisterDeviceHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = unregisterSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid device token data.", parsed.error.flatten());
  await notificationService.unregisterDeviceToken(parsed.data.token);
  res.json({ success: true, message: "تم إلغاء تسجيل الجهاز." });
});
