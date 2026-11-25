import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireSystemAdmin } from "../../middleware/rbac.middleware";
import { listUsersHandler, getUserHandler, createUserHandler, updateUserHandler } from "./user.controller";

const router = Router();
router.use(authMiddleware, requireSystemAdmin);

router.get("/", listUsersHandler);
router.get("/:id", getUserHandler);
router.post("/", createUserHandler);
router.put("/:id", updateUserHandler);

export default router;
