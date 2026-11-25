import { useEffect, useState, FormEvent } from "react";
import { api, parseApiError } from "../../lib/api";

interface Unit { id: string; unitNo: number; description: string; status: string; }

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await api.get("/config/units");
    setUnits(res.data.data);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      await api.post("/config/units", { description, status: "ACTIVE" });
      setDescription("");
      await load();
    } catch (err: any) {
      setError(parseApiError(err).message);
    } finally { setSaving(false); }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <form onSubmit={handleSubmit} className="card space-y-3 h-fit">
        <h2 className="font-bold">إضافة وحدة</h2>
        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
        <input className="input" placeholder="مثال: لتر" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "..." : "حفظ"}</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead><tr className="border-b text-gray-500"><th className="py-2">الرقم</th><th>الوصف</th></tr></thead>
          <tbody>{units.map((u) => <tr key={u.id} className="border-b last:border-0"><td className="py-2">{u.unitNo}</td><td>{u.description}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
