import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireScreen, requireScreenAndPermission } from "../../middleware/rbac.middleware";
import * as ctrl from "./config.controller";

// Company
export const companyRouter = Router();
companyRouter.use(authMiddleware, requireScreen("company"));
companyRouter.get("/", ctrl.getCompanyHandler);
companyRouter.put("/", requireScreenAndPermission("company", "canEdit"), ctrl.upsertCompanyHandler);

// Units
export const unitRouter = Router();
unitRouter.use(authMiddleware, requireScreen("units"));
unitRouter.get("/", ctrl.listUnitsHandler);
unitRouter.post("/", requireScreenAndPermission("units", "canAdd"), ctrl.createUnitHandler);
unitRouter.put("/:id", requireScreenAndPermission("units", "canEdit"), ctrl.updateUnitHandler);

// Maintenance / Fault codes
export const codesRouter = Router();
codesRouter.use(authMiddleware, requireScreen("codes"));
codesRouter.get("/maintenance-types", ctrl.listMaintenanceTypesHandler);
codesRouter.post("/maintenance-types", requireScreenAndPermission("codes", "canAdd"), ctrl.createMaintenanceTypeHandler);
codesRouter.get("/fault-types", ctrl.listFaultTypesHandler);
codesRouter.post("/fault-types", requireScreenAndPermission("codes", "canAdd"), ctrl.createFaultTypeHandler);

// Vendors
export const vendorRouter = Router();
vendorRouter.use(authMiddleware, requireScreen("codes"));
vendorRouter.get("/", ctrl.listVendorsHandler);
vendorRouter.post("/", requireScreenAndPermission("codes", "canAdd"), ctrl.createVendorHandler);

// Error codes (readable by any authenticated user — used by the Error Code Guide UI)
export const errorCodeRouter = Router();
errorCodeRouter.use(authMiddleware);
errorCodeRouter.get("/", ctrl.listErrorCodesHandler);
