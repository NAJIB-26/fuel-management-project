import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../lib/authStore";

interface ScreenLink { path: string; label: string; screenKey: string; }
interface TabDef { key: string; label: string; screens: ScreenLink[]; }

const ALL_TABS: TabDef[] = [
  {
    key: "config", label: "تهيئة النظام",
    screens: [
      { path: "/config/company", label: "بيانات الشركة", screenKey: "company" },
      { path: "/users", label: "المستخدمون", screenKey: "users" },
      { path: "/trucks", label: "الشاحنات", screenKey: "trucks" },
      { path: "/config/units", label: "الوحدات", screenKey: "units" },
      { path: "/permissions", label: "الصلاحيات", screenKey: "permissions" },
      { path: "/config/codes", label: "أنواع الصيانة", screenKey: "codes" },
      { path: "/config/vendors", label: "الموردون", screenKey: "codes" },
    ],
  },
  {
    key: "transactions", label: "العمليات والطلبات",
    screens: [
      { path: "/fuel-requests", label: "طلب محروقات", screenKey: "fuel-requests" },
      { path: "/periodic-maintenance", label: "صيانة دورية", screenKey: "periodic-maintenance" },
      { path: "/general-maintenance", label: "صيانة عامة", screenKey: "general-maintenance" },
    ],
  },
  {
    key: "reports", label: "التقارير",
    screens: [
      { path: "/dashboard", label: "لوحة الإحصائيات", screenKey: "dashboard" },
      { path: "/audit-log", label: "سجل التتبع", screenKey: "audit-log" },
    ],
  },
];

function filterTabs(isAdmin: boolean, tabPerms: string[], screenPerms: string[]): TabDef[] {
  if (isAdmin) return ALL_TABS;
  return ALL_TABS
    .filter((t) => tabPerms.includes(t.key))
    .map((t) => ({ ...t, screens: t.screens.filter((s) => screenPerms.includes(s.screenKey)) }))
    .filter((t) => t.screens.length > 0);
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);
  const logout = useAuthStore((s) => s.logout);

  const visibleTabs = filterTabs(
    permissions?.isSystemAdmin ?? false,
    permissions?.tabPermissions ?? [],
    permissions?.screenPermissions ?? []
  );

  const [activeTab, setActiveTab] = useState(
    visibleTabs.find((t) => t.screens.some((s) => s.path === location.pathname))?.key ?? visibleTabs[0]?.key
  );
  const currentTab = visibleTabs.find((t) => t.key === activeTab) ?? visibleTabs[0];

  if (visibleTabs.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">لا توجد صلاحيات وصول. تواصل مع مدير النظام.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white flex items-center justify-between px-4 py-2">
        <div className="font-bold">نظام مراقبة المحروقات والصيانة</div>
        <div className="flex items-center gap-3 text-sm">
          <span>{user?.fullName}</span>
          <button onClick={() => { logout(); navigate("/login"); }} className="hover:underline">خروج</button>
        </div>
      </header>

      <nav className="bg-white border-b flex px-4 gap-2">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); navigate(tab.screens[0].path); }}
            className={`px-4 py-2 text-sm border-b-2 ${activeTab === tab.key ? "border-primary text-primary font-semibold" : "border-transparent text-gray-600"}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {currentTab && (
        <div className="bg-gray-50 border-b px-4 py-2 flex gap-2 overflow-x-auto">
          {currentTab.screens.map((s) => (
            <button
              key={s.path + s.screenKey}
              onClick={() => navigate(s.path)}
              className={`px-3 py-1 rounded text-xs whitespace-nowrap ${location.pathname === s.path ? "bg-primary text-white" : "bg-white border border-gray-200"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
