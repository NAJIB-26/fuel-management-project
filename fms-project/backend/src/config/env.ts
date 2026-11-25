import "dotenv/config";

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

export const env = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  DATABASE_URL: required("DATABASE_URL"),
  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
};
