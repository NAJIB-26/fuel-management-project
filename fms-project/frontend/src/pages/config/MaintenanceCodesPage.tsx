import { useEffect, useState, FormEvent } from "react";
import { api, parseApiError } from "../../lib/api";

interface Code { id: string; name: string; category?: string; }

export default function MaintenanceCodesPage() {
  const [types, setTypes] = useState<Code[]>([]);
  const [faults, setFaults] = useState<Code[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("PERIODIC");
  const [faultName, setFaultName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [t, f] = await Promise.all([
      api.get("/config/codes/maintenance-types"),
      api.get("/config/codes/fault-types"),
    ]);
    setTypes(t.data.data);
    setFaults(f.data.data);
  }
  useEffect(() => { load(); }, []);

  async function addType(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/config/codes/maintenance-types", { name, category });
      setName(""); await load();
    } catch (err: any) { setError(parseApiError(err).message); }
  }

  async function addFault(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/config/codes/fault-types", { name: faultName });
      setFaultName(""); await load();
    } catch (err: any) { setError(parseApiError(err).message); }
  }

  return (
    <div className="space-y-4">
      {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
      <form onSubmit={addType} className="card space-y-3">
        <h2 className="font-bold">أنواع الصيانة</h2>
        <div className="flex gap-2">
          <input className="input" placeholder="اسم النوع" value={name} onChange={(e) => setName(e.target.value)} required />
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="PERIODIC">دورية</option>
            <option value="GENERAL">عامة</option>
          </select>
          <button type="submit" className="btn-primary">إضافة</button>
        </div>
        <div className="flex flex-wrap gap-2">{types.map((t) => <span key={t.id} className="px-2 py-1 bg-gray-100 rounded text-xs">{t.name}</span>)}</div>
      </form>

      <form onSubmit={addFault} className="card space-y-3">
        <h2 className="font-bold">أنواع الأعطال</h2>
        <div className="flex gap-2">
          <input className="input" placeholder="نوع الخلل" value={faultName} onChange={(e) => setFaultName(e.target.value)} required />
          <button type="submit" className="btn-primary">إضافة</button>
        </div>
        <div className="flex flex-wrap gap-2">{faults.map((f) => <span key={f.id} className="px-2 py-1 bg-gray-100 rounded text-xs">{f.name}</span>)}</div>
      </form>
    </div>
  );
}
