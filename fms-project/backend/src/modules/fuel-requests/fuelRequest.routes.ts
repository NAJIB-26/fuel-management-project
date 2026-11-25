import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireScreen, requireScreenAndPermission } from "../../middleware/rbac.middleware";
import {
  createFuelRequestHandler, getFuelRequestHandler, listFuelRequestsHandler, approveFuelRequestHandler,
} from "./fuelRequest.controller";

const router = Router();
router.use(authMiddleware, requireScreen("fuel-requests"));

router.get("/", listFuelRequestsHandler);
router.get("/:id", getFuelRequestHandler);
router.post("/", requireScreenAndPermission("fuel-requests", "canAdd"), createFuelRequestHandler);
router.post("/:id/approve", approveFuelRequestHandler);

export default router;
