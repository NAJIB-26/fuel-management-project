import bcrypt from "bcrypt";
import { prisma } from "../../config/db";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username }, include: { permissions: true } });
  if (!user) throw new ApiError(401, "ERR-105", "Invalid username or password.");
  if (user.status === "SUSPENDED") throw new ApiError(403, "ERR-106", "Account suspended.");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, "ERR-105", "Invalid username or password.");

  const accessToken = signAccessToken({
    userId: user.id,
    username: user.username,
    isSystemAdmin: user.permissions?.isSystemAdmin ?? false,
  });
  const refreshToken = signRefreshToken(user.id);

  await prisma.auditLog.create({ data: { userId: user.id, action: "LOGIN", entityType: "User", entityId: user.id } });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, fullName: user.fullName, username: user.username, jobLevel: user.jobLevel },
  };
}

export async function refresh(token: string) {
  const { userId } = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { permissions: true } });
  if (!user || user.status === "SUSPENDED") throw new ApiError(401, "ERR-102", "User inactive or not found.");

  return signAccessToken({
    userId: user.id,
    username: user.username,
    isSystemAdmin: user.permissions?.isSystemAdmin ?? false,
  });
}

export async function changePassword(username: string, oldPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new ApiError(404, "ERR-107", "User not found.");

  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) throw new ApiError(401, "ERR-108", "Previous password incorrect.");

  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  await prisma.auditLog.create({ data: { userId: user.id, action: "PASSWORD_CHANGE", entityType: "User", entityId: user.id } });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, fullName: true, username: true, jobLevel: true, department: true,
      managedBy: { select: { id: true, fullName: true } },
      permissions: {
        select: {
          isSystemAdmin: true, tabPermissions: true, screenPermissions: true,
          canAdd: true, canEdit: true, canPrint: true, canViewReports: true,
          canApproveLevel1: true, canApproveLevel2: true,
        },
      },
    },
  });
  if (!user) throw new ApiError(404, "ERR-107", "User not found.");
  return user;
}
