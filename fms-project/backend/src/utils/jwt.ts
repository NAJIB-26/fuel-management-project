import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  userId: string;
  username: string;
  isSystemAdmin: boolean;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
}
