import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";

// ---- Company ----
export async function getCompany() {
  return prisma.company.findFirst();
}

export async function upsertCompany(data: any, userId: string) {
  const existing = await prisma.company.findFirst();
  const company = existing
    ? await prisma.company.update({ where: { id: existing.id }, data })
    : await prisma.company.create({ data });

  await prisma.auditLog.create({
    data: { userId, action: existing ? "UPDATE" : "CREATE", entityType: "Company", entityId: company.id, newValues: company as any },
  });
  return company;
}

// ---- Units ----
export async function listUnits() {
  return prisma.unit.findMany({ orderBy: { unitNo: "asc" } });
}

export async function createUnit(data: any, userId: string) {
  const unit = await prisma.unit.create({ data });
  await prisma.auditLog.create({ data: { userId, action: "CREATE", entityType: "Unit", entityId: unit.id, newValues: unit as any } });
  return unit;
}

export async function updateUnit(id: string, data: any, userId: string) {
  const existing = await prisma.unit.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "ERR-313", "Unit not found.");
  const unit = await prisma.unit.update({ where: { id }, data });
  await prisma.auditLog.create({ data: { userId, action: "UPDATE", entityType: "Unit", entityId: id, oldValues: existing as any, newValues: unit as any } });
  return unit;
}

// ---- Maintenance / Fault Type Codes ----
export async function listMaintenanceTypes() {
  return prisma.maintenanceTypeCode.findMany({ orderBy: { name: "asc" } });
}

export async function createMaintenanceType(data: any, userId: string) {
  const item = await prisma.maintenanceTypeCode.create({ data });
  await prisma.auditLog.create({ data: { userId, action: "CREATE", entityType: "MaintenanceTypeCode", entityId: item.id, newValues: item as any } });
  return item;
}

export async function listFaultTypes() {
  return prisma.faultTypeCode.findMany({ orderBy: { name: "asc" } });
}

export async function createFaultType(name: string, userId: string) {
  const item = await prisma.faultTypeCode.create({ data: { name } });
  await prisma.auditLog.create({ data: { userId, action: "CREATE", entityType: "FaultTypeCode", entityId: item.id, newValues: item as any } });
  return item;
}

// ---- Vendors ----
export async function listVendors(type?: "FUEL_STATION" | "WORKSHOP") {
  return prisma.vendor.findMany({ where: type ? { type } : undefined, orderBy: { name: "asc" } });
}

export async function createVendor(data: any, userId: string) {
  const vendor = await prisma.vendor.create({ data });
  await prisma.auditLog.create({ data: { userId, action: "CREATE", entityType: "Vendor", entityId: vendor.id, newValues: vendor as any } });
  return vendor;
}

// ---- Error Codes ----
export async function listErrorCodes() {
  return prisma.errorCode.findMany({ orderBy: { code: "asc" } });
}
