import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";

export async function getPermissionByUserId(userId: string) {
  const permission = await prisma.permission.findUnique({ where: { userId } });
  if (!permission) throw new ApiError(404, "ERR-201", "No permissions assigned.");
  return permission;
}

export async function updatePermission(userId: string, data: any, actorId: string) {
  const existing = await prisma.permission.findUnique({ where: { userId } });
  if (!existing) throw new ApiError(404, "ERR-201", "No permissions assigned.");

  const updated = await prisma.permission.update({ where: { userId }, data });

  await prisma.auditLog.create({
    data: { userId: actorId, action: "UPDATE", entityType: "Permission", entityId: updated.id, oldValues: existing as any, newValues: updated as any },
  });

  return updated;
}

export async function searchUsersForPermissionAssign(query: string) {
  return prisma.user.findMany({
    where: { fullName: { contains: query, mode: "insensitive" } },
    select: { id: true, fullName: true, username: true, department: true },
    take: 10,
  });
}
