import { useState, useEffect } from "react";
import { api, parseApiError } from "../../lib/api";

interface UserSearchResult { id: string; fullName: string; username: string; }

const SCREENS = [
  "company", "users", "trucks", "units", "permissions", "codes",
  "fuel-requests", "periodic-maintenance", "general-maintenance", "dashboard", "audit-log",
];
const TABS = ["config", "transactions", "reports"];

export default function PermissionsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [perm, setPerm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (query.trim().length < 1) { setResults([]); return; }
    const t = setTimeout(() => {
      api.get("/permissions/search-users", { params: { q: query } }).then((res) => setResults(res.data.data));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  async function selectUser(u: UserSearchResult) {
    setSelectedUser(u);
    setQuery(u.fullName);
    setResults([]);
    const res = await api.get(`/permissions/${u.id}`);
    setPerm(res.data.data);
  }

  function toggleList(key: "tabPermissions" | "screenPermissions", value: string) {
    const list: string[] = perm[key] || [];
    setPerm({ ...perm, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  }

  async function handleSave() {
    if (!selectedUser) return;
    setError(null); setSaving(true);
    try {
      await api.put(`/permissions/${selectedUser.id}`, perm);
    } catch (err: any) {
      setError(parseApiError(err).message);
    } finally { setSaving(false); }
  }

  return (
    <div className="card space-y-4 max-w-3xl relative">
      <h2 className="font-bold">الصلاحيات والأذونات</h2>
      {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

      <div className="relative">
        <input className="input" placeholder="بحث عن مستخدم..." value={query} onChange={(e) => setQuery(e.target.value)} />
        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
            {results.map((u) => (
              <button key={u.id} onClick={() => selectUser(u)} className="w-full text-right px-3 py-2 text-sm hover:bg-gray-50">
                {u.fullName} ({u.username})
              </button>
            ))}
          </div>
        )}
      </div>

      {perm && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 bg-primary/5 p-3 rounded">
            <input type="checkbox" checked={perm.isSystemAdmin} onChange={() => setPerm({ ...perm, isSystemAdmin: !perm.isSystemAdmin })} />
            مدير النظام
          </label>

          <div>
            <h3 className="font-semibold text-sm mb-2">التبويبات</h3>
            <div className="flex gap-3 flex-wrap">
              {TABS.map((t) => (
                <label key={t} className="text-sm flex items-center gap-1">
                  <input type="checkbox" checked={perm.tabPermissions?.includes(t)} onChange={() => toggleList("tabPermissions", t)} /> {t}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">الشاشات</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SCREENS.map((s) => (
                <label key={s} className="text-sm flex items-center gap-1">
                  <input type="checkbox" checked={perm.screenPermissions?.includes(s)} onChange={() => toggleList("screenPermissions", s)} /> {s}
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "..." : "حفظ"}</button>
        </div>
      )}
    </div>
  );
}
