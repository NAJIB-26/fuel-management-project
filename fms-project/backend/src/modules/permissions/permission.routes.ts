import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireSystemAdmin } from "../../middleware/rbac.middleware";
import { getPermissionHandler, updatePermissionHandler, searchUsersHandler } from "./permission.controller";

const router = Router();
router.use(authMiddleware, requireSystemAdmin);

router.get("/search-users", searchUsersHandler);
router.get("/:userId", getPermissionHandler);
router.put("/:userId", updatePermissionHandler);

export default router;
