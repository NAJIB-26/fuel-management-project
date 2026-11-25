import { useEffect, useState, FormEvent } from "react";
import { api, parseApiError } from "../../lib/api";

interface UserItem {
  id: string; employeeNo: number; fullName: string; jobLevel: string; department: string;
  status: string; username: string; managedById?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [employeeNo, setEmployeeNo] = useState("");
  const [fullName, setFullName] = useState("");
  const [jobLevel, setJobLevel] = useState("");
  const [department, setDepartment] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [managedById, setManagedById] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await api.get("/users", { params: { pageSize: 100 } });
    setUsers(res.data.data.items);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      await api.post("/users", {
        employeeNo: employeeNo ? Number(employeeNo) : undefined,
        fullName, jobLevel, department, username, password,
        managedById: managedById || undefined,
      });
      setEmployeeNo(""); setFullName(""); setJobLevel(""); setDepartment("");
      setUsername(""); setPassword(""); setManagedById("");
      await load();
    } catch (err: any) {
      setError(parseApiError(err).message);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="font-bold">إضافة موظف</h2>
        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs mb-1">الرقم الوظيفي (اختياري - أرقام فقط)</label>
            <input
              type="text" inputMode="numeric" className="input"
              value={employeeNo}
              onChange={(e) => setEmployeeNo(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="يُولّد تلقائياً إن ترك فارغاً"
            />
          </div>
          <input className="input" placeholder="اسم الموظف" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <input className="input" placeholder="المستوى الوظيفي" value={jobLevel} onChange={(e) => setJobLevel(e.target.value)} required />
          <input className="input" placeholder="القسم" value={department} onChange={(e) => setDepartment(e.target.value)} required />
          <div>
            <label className="block text-xs mb-1">المسؤول المباشر</label>
            <select className="input" value={managedById} onChange={(e) => setManagedById(e.target.value)}>
              <option value="">بدون</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
            </select>
          </div>
          <input className="input" placeholder="اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" className="input" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "..." : "حفظ"}</button>
      </form>

      <div className="card overflow-x-auto max-h-[65vh] overflow-y-auto">
        <table className="w-full text-sm text-right">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b text-gray-500"><th className="py-2">الرقم</th><th>الاسم</th><th>القسم</th><th>الحالة</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-2">{u.employeeNo}</td><td>{u.fullName}</td><td>{u.department}</td><td>{u.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
