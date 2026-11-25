import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  listNotificationsHandler, markReadHandler, markAllReadHandler, registerDeviceHandler, unregisterDeviceHandler,
} from "./notification.controller";

const router = Router();
router.use(authMiddleware);

router.get("/", listNotificationsHandler);
router.post("/:id/read", markReadHandler);
router.post("/read-all", markAllReadHandler);
router.post("/devices/register", registerDeviceHandler);
router.post("/devices/unregister", unregisterDeviceHandler);

export default router;
