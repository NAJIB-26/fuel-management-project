import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireSystemAdmin } from "../../middleware/rbac.middleware";
import { listAuditLogsHandler } from "./audit.controller";

const router = Router();
router.use(authMiddleware, requireSystemAdmin);
router.get("/", listAuditLogsHandler);

export default router;
