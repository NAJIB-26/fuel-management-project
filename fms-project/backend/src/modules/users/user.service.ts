import bcrypt from "bcrypt";
import { prisma } from "../../config/db";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { Prisma } from "@prisma/client";

export async function listUsers(params: { page: number; pageSize: number; search?: string; status?: "ACTIVE" | "SUSPENDED" }) {
  const where: Prisma.UserWhereInput = {
    ...(params.status && { status: params.status }),
    ...(params.search && {
      OR: [
        { fullName: { contains: params.search, mode: "insensitive" } },
        { username: { contains: params.search, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      orderBy: { employeeNo: "asc" },
      select: {
        id: true, employeeNo: true, addedDate: true, fullName: true, jobLevel: true,
        department: true, status: true, username: true, managedById: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page: params.page, pageSize: params.pageSize };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, employeeNo: true, addedDate: true, fullName: true, jobLevel: true,
      department: true, status: true, username: true, managedById: true, permissions: true,
    },
  });
  if (!user) throw new ApiError(404, "ERR-107", "User not found.");
  return user;
}

export async function createUser(data: any, actorId: string) {
  const existing = await prisma.user.findUnique({ where: { username: data.username } });
  if (existing) throw new ApiError(409, "ERR-109", "Username already exists.");

  if (data.employeeNo != null) {
    const dupEmp = await prisma.user.findUnique({ where: { employeeNo: data.employeeNo } });
    if (dupEmp) throw new ApiError(409, "ERR-317", "Employee number already in use.");
  }

  const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      ...(data.employeeNo != null && { employeeNo: data.employeeNo }),
      fullName: data.fullName,
      jobLevel: data.jobLevel,
      department: data.department,
      status: data.status,
      username: data.username,
      passwordHash,
      managedById: data.managedById,
      permissions: { create: {} },
    },
    select: {
      id: true, employeeNo: true, addedDate: true, fullName: true, jobLevel: true,
      department: true, status: true, username: true,
    },
  });

  await prisma.auditLog.create({ data: { userId: actorId, action: "CREATE", entityType: "User", entityId: user.id, newValues: user as any } });
  return user;
}

export async function updateUser(id: string, data: any, actorId: string) {
  const existing = await getUserById(id);

  const user = await prisma.user.update({
    where: { id },
    data: {
      fullName: data.fullName,
      jobLevel: data.jobLevel,
      department: data.department,
      status: data.status,
      managedById: data.managedById,
    },
    select: {
      id: true, employeeNo: true, addedDate: true, fullName: true, jobLevel: true,
      department: true, status: true, username: true,
    },
  });

  await prisma.auditLog.create({
    data: { userId: actorId, action: "UPDATE", entityType: "User", entityId: id, oldValues: existing as any, newValues: user as any },
  });

  return user;
}
