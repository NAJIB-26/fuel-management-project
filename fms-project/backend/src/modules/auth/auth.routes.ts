import { Router } from "express";
import { loginHandler, refreshHandler, changePasswordHandler, getMeHandler } from "./auth.controller";
import { loginRateLimiter } from "../../middleware/rateLimit.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/login", loginRateLimiter, loginHandler);
router.post("/refresh", refreshHandler);
router.post("/change-password", changePasswordHandler);
router.get("/me", authMiddleware, getMeHandler);

export default router;
