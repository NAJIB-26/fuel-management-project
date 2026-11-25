import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { Prisma } from "@prisma/client";

interface ListParams {
  page: number;
  pageSize: number;
  status?: "ACTIVE" | "IN_MAINTENANCE" | "SOLD";
  search?: string;
}

export async function listTrucks(params: ListParams) {
  const where: Prisma.TruckWhereInput = {
    ...(params.status && { status: params.status }),
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: "insensitive" } },
        { plateNo: { contains: params.search, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.truck.findMany({
      where,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      orderBy: { createdAt: "desc" },
      include: { maintenanceLimits: true },
    }),
    prisma.truck.count({ where }),
  ]);

  return { items, total, page: params.page, pageSize: params.pageSize };
}

export async function getTruckById(id: string) {
  const truck = await prisma.truck.findUnique({ where: { id }, include: { maintenanceLimits: true } });
  if (!truck) throw new ApiError(404, "ERR-301", "Truck not found.");
  return truck;
}

export async function createTruck(data: any, userId: string) {
  const existing = await prisma.truck.findUnique({ where: { plateNo: data.plateNo } });
  if (existing) throw new ApiError(409, "ERR-302", "Plate number already registered.");

  const truck = await prisma.truck.create({
    data: {
      name: data.name,
      model: data.model,
      yearMade: data.yearMade,
      plateNo: data.plateNo,
      tankCapacityLiters: data.tankCapacityLiters,
      fuelType: data.fuelType,
      engineOilType: data.engineOilType,
      imageUrl: data.imageUrl,
      status: data.status,
      insuranceExpiry: data.insuranceExpiry,
      licenseExpiry: data.licenseExpiry,
      maintenanceLimits: data.maintenanceLimits
        ? { create: data.maintenanceLimits.map((l: any) => ({ kind: l.kind, limitKm: l.limitKm })) }
        : undefined,
    },
    include: { maintenanceLimits: true },
  });

  await prisma.auditLog.create({ data: { userId, action: "CREATE", entityType: "Truck", entityId: truck.id, newValues: truck as any } });
  return truck;
}

export async function updateTruck(id: string, data: any, userId: string) {
  const existing = await getTruckById(id);

  if (data.plateNo && data.plateNo !== existing.plateNo) {
    const dup = await prisma.truck.findUnique({ where: { plateNo: data.plateNo } });
    if (dup) throw new ApiError(409, "ERR-302", "Plate number already registered.");
  }

  const truck = await prisma.$transaction(async (tx) => {
    if (data.maintenanceLimits) {
      for (const limit of data.maintenanceLimits) {
        await tx.truckMaintenanceLimit.upsert({
          where: { truckId_kind: { truckId: id, kind: limit.kind } },
          update: { limitKm: limit.limitKm },
          create: { truckId: id, kind: limit.kind, limitKm: limit.limitKm },
        });
      }
    }

    return tx.truck.update({
      where: { id },
      data: {
        name: data.name,
        model: data.model,
        yearMade: data.yearMade,
        plateNo: data.plateNo,
        tankCapacityLiters: data.tankCapacityLiters,
        fuelType: data.fuelType,
        engineOilType: data.engineOilType,
        imageUrl: data.imageUrl,
        status: data.status,
        insuranceExpiry: data.insuranceExpiry,
        licenseExpiry: data.licenseExpiry,
      },
      include: { maintenanceLimits: true },
    });
  });

  await prisma.auditLog.create({
    data: { userId, action: "UPDATE", entityType: "Truck", entityId: id, oldValues: existing as any, newValues: truck as any },
  });

  return truck;
}

export async function deleteTruck(id: string, userId: string) {
  const existing = await getTruckById(id);
  const fuelCount = await prisma.fuelRequest.count({ where: { truckId: id } });
  if (fuelCount > 0) {
    throw new ApiError(409, "ERR-303", "Cannot delete truck with existing transaction history. Set status to SOLD instead.");
  }
  await prisma.truck.delete({ where: { id } });
  await prisma.auditLog.create({ data: { userId, action: "DELETE", entityType: "Truck", entityId: id, oldValues: existing as any } });
}
