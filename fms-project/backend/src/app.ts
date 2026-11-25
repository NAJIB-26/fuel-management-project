import express from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import authRoutes from "./modules/auth/auth.routes";
import truckRoutes from "./modules/trucks/truck.routes";
import fuelRequestRoutes from "./modules/fuel-requests/fuelRequest.routes";
import periodicMaintenanceRoutes from "./modules/periodic-maintenance/periodicMaintenance.routes";
import generalMaintenanceRoutes from "./modules/general-maintenance/generalMaintenance.routes";
import userRoutes from "./modules/users/user.routes";
import permissionRoutes from "./modules/permissions/permission.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import auditRoutes from "./modules/audit/audit.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import {
  companyRouter, unitRouter, codesRouter, vendorRouter, errorCodeRouter,
} from "./modules/config/config.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { apiRateLimiter } from "./middleware/rateLimit.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(hpp());
app.use(apiRateLimiter);

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/trucks", truckRoutes);
app.use("/api/fuel-requests", fuelRequestRoutes);
app.use("/api/periodic-maintenance", periodicMaintenanceRoutes);
app.use("/api/general-maintenance", generalMaintenanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit-log", auditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/config/company", companyRouter);
app.use("/api/config/units", unitRouter);
app.use("/api/config/codes", codesRouter);
app.use("/api/config/vendors", vendorRouter);
app.use("/api/config/error-codes", errorCodeRouter);

app.use(errorMiddleware);

export default app;
