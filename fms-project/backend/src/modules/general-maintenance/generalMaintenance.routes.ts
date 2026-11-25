import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireScreen, requireScreenAndPermission } from "../../middleware/rbac.middleware";
import {
  createGeneralRequestHandler, getGeneralRequestHandler, listGeneralRequestsHandler, approveGeneralRequestHandler,
} from "./generalMaintenance.controller";

const router = Router();
router.use(authMiddleware, requireScreen("general-maintenance"));

router.get("/", listGeneralRequestsHandler);
router.get("/:id", getGeneralRequestHandler);
router.post("/", requireScreenAndPermission("general-maintenance", "canAdd"), createGeneralRequestHandler);
router.post("/:id/approve", approveGeneralRequestHandler);

export default router;
