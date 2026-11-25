import { create } from "zustand";

interface AuthUser {
  id: string;
  fullName: string;
  username: string;
  jobLevel: string;
  managedBy?: { id: string; fullName: string } | null;
}

interface Permissions {
  isSystemAdmin: boolean;
  tabPermissions: string[];
  screenPermissions: string[];
  canAdd: boolean;
  canEdit: boolean;
  canPrint: boolean;
  canViewReports: boolean;
  canApproveLevel1: boolean;
  canApproveLevel2: boolean;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  permissions: Permissions | null;
  setSession: (accessToken: string, user: AuthUser) => void;
  setPermissions: (permissions: Permissions) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: sessionStorage.getItem("accessToken"),
  user: JSON.parse(sessionStorage.getItem("user") || "null"),
  permissions: JSON.parse(sessionStorage.getItem("permissions") || "null"),
  setSession: (accessToken, user) => {
    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("user", JSON.stringify(user));
    set({ accessToken, user });
  },
  setPermissions: (permissions) => {
    sessionStorage.setItem("permissions", JSON.stringify(permissions));
    set({ permissions });
  },
  logout: () => {
    sessionStorage.clear();
    set({ accessToken: null, user: null, permissions: null });
  },
}));
