import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireScreen } from "../../middleware/rbac.middleware";
import { getDashboardHandler } from "./dashboard.controller";

const router = Router();
router.use(authMiddleware, requireScreen("dashboard"));
router.get("/", getDashboardHandler);

export default router;
