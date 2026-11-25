import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireScreen, requireScreenAndPermission } from "../../middleware/rbac.middleware";
import {
  createPeriodicRequestHandler, getPeriodicRequestHandler, listPeriodicRequestsHandler, approvePeriodicRequestHandler,
} from "./periodicMaintenance.controller";

const router = Router();
router.use(authMiddleware, requireScreen("periodic-maintenance"));

router.get("/", listPeriodicRequestsHandler);
router.get("/:id", getPeriodicRequestHandler);
router.post("/", requireScreenAndPermission("periodic-maintenance", "canAdd"), createPeriodicRequestHandler);
router.post("/:id/approve", approvePeriodicRequestHandler);

export default router;
