import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: "ERR-104", message: "Too many login attempts. Try again later." },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
});
