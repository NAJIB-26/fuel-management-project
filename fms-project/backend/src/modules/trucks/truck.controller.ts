import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { createTruckSchema, updateTruckSchema, truckQuerySchema } from "./truck.validation";
import * as truckService from "./truck.service";

export const listTrucksHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = truckQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid query parameters.", parsed.error.flatten());
  res.json({ success: true, data: await truckService.listTrucks(parsed.data) });
});

export const getTruckHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await truckService.getTruckById(req.params.id) });
});

export const createTruckHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createTruckSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid truck data.", parsed.error.flatten());
  const truck = await truckService.createTruck(parsed.data, req.user!.userId);
  res.status(201).json({ success: true, data: truck, message: "Truck saved successfully." });
});

export const updateTruckHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateTruckSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "ERR-001", "Invalid truck data.", parsed.error.flatten());
  const truck = await truckService.updateTruck(req.params.id, parsed.data, req.user!.userId);
  res.json({ success: true, data: truck, message: "Truck updated successfully." });
});

export const deleteTruckHandler = asyncHandler(async (req: Request, res: Response) => {
  await truckService.deleteTruck(req.params.id, req.user!.userId);
  res.json({ success: true, message: "Truck deleted successfully." });
});
