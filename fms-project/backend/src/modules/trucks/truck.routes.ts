import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireScreen, requireScreenAndPermission } from "../../middleware/rbac.middleware";
import {
  listTrucksHandler, getTruckHandler, createTruckHandler, updateTruckHandler, deleteTruckHandler,
} from "./truck.controller";

const router = Router();
router.use(authMiddleware, requireScreen("trucks"));

router.get("/", listTrucksHandler);
router.get("/:id", getTruckHandler);
router.post("/", requireScreenAndPermission("trucks", "canAdd"), createTruckHandler);
router.put("/:id", requireScreenAndPermission("trucks", "canEdit"), updateTruckHandler);
router.delete("/:id", requireScreenAndPermission("trucks", "canEdit"), deleteTruckHandler);

export default router;
