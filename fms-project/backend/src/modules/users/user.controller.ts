import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { createUserSchema, updateUserSchema, userQuerySchema } from "./user.validation";
import * as userService from "./user.service";

export const listUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = userQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid query parameters.", parsed.error.flatten());
  res.json({ success: true, data: await userService.listUsers(parsed.data) });
});

export const getUserHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await userService.getUserById(req.params.id) });
});

export const createUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid user data.", parsed.error.flatten());
  const user = await userService.createUser(parsed.data, req.user!.userId);
  res.status(201).json({ success: true, data: user, message: "User saved successfully." });
});

export const updateUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid user data.", parsed.error.flatten());
  const user = await userService.updateUser(req.params.id, parsed.data, req.user!.userId);
  res.json({ success: true, data: user, message: "User updated successfully." });
});
