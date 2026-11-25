import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../lib/authStore";

const PATH_SCREEN_MAP: Record<string, string> = {
  "/config/company": "company",
  "/users": "users",
  "/trucks": "trucks",
  "/config/units": "units",
  "/permissions": "permissions",
  "/config/codes": "codes",
  "/config/vendors": "codes",
  "/fuel-requests": "fuel-requests",
  "/periodic-maintenance": "periodic-maintenance",
  "/general-maintenance": "general-maintenance",
  "/dashboard": "dashboard",
  "/audit-log": "audit-log",
};

export default function ScreenGuard() {
  const location = useLocation();
  const permissions = useAuthStore((s) => s.permissions);
  const isSystemAdmin = permissions?.isSystemAdmin ?? false;
  const screenPerms = permissions?.screenPermissions ?? [];
  const requiredKey = PATH_SCREEN_MAP[location.pathname];

  if (!requiredKey) return <Outlet />;
  if (isSystemAdmin || screenPerms.includes(requiredKey)) return <Outlet />;

  const fallback = Object.entries(PATH_SCREEN_MAP).find(([, key]) => screenPerms.includes(key));
  return <Navigate to={fallback ? fallback[0] : "/login"} replace />;
}
