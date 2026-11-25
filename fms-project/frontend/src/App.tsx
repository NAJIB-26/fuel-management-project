import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TrucksPage from "./pages/trucks/TrucksPage";
import FuelRequestPage from "./pages/fuel-requests/FuelRequestPage";
import PeriodicRequestPage from "./pages/periodic-maintenance/PeriodicRequestPage";
import GeneralRequestPage from "./pages/general-maintenance/GeneralRequestPage";
import UsersPage from "./pages/users/UsersPage";
import PermissionsPage from "./pages/permissions/PermissionsPage";
import CompanySettingsPage from "./pages/config/CompanySettingsPage";
import UnitsPage from "./pages/config/UnitsPage";
import MaintenanceCodesPage from "./pages/config/MaintenanceCodesPage";
import VendorsPage from "./pages/config/VendorsPage";
import AuditLogPage from "./pages/audit/AuditLogPage";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./routes/ProtectedRoute";
import ScreenGuard from "./routes/ScreenGuard";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route element={<ScreenGuard />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trucks" element={<TrucksPage />} />
            <Route path="/fuel-requests" element={<FuelRequestPage />} />
            <Route path="/periodic-maintenance" element={<PeriodicRequestPage />} />
            <Route path="/general-maintenance" element={<GeneralRequestPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/permissions" element={<PermissionsPage />} />
            <Route path="/config/company" element={<CompanySettingsPage />} />
            <Route path="/config/units" element={<UnitsPage />} />
            <Route path="/config/codes" element={<MaintenanceCodesPage />} />
            <Route path="/config/vendors" element={<VendorsPage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
