import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken, AccessTokenPayload } from "../utils/jwt";
import { prisma } from "../config/db";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "ERR-101", "Authentication token missing.");
    }
    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.status === "SUSPENDED") {
      throw new ApiError(401, "ERR-102", "User inactive or not found.");
    }

    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, "ERR-103", "Invalid or expired token."));
  }
}
