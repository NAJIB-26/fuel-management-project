import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }
  console.error(err);
  return res.status(500).json({ success: false, code: "ERR-500", message: "Internal server error." });
}
