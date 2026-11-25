import { useEffect, useState, FormEvent } from "react";
import { api, parseApiError } from "../../lib/api";

interface Truck {
  id: string; name: string; model: string; plateNo: string; fuelType: string; engineOilType?: string; status: string;
}

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [plateNo, setPlateNo] = useState("");
  const [engineOilType, setEngineOilType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await api.get("/trucks", { params: { pageSize: 50 } });
    setTrucks(res.data.data.items);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      await api.post("/trucks", {
        name, model, plateNo, engineOilType: engineOilType || undefined,
        yearMade: new Date().getFullYear(), tankCapacityLiters: 400, fuelType: "DIESEL",
      });
      setName(""); setModel(""); setPlateNo(""); setEngineOilType("");
      await load();
    } catch (err: any) {
      setError(parseApiError(err).message);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="font-bold">إضافة شاحنة</h2>
        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input className="input" placeholder="اسم الشاحنة" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="input" placeholder="الموديل" value={model} onChange={(e) => setModel(e.target.value)} required />
          <input className="input" placeholder="رقم اللوحة" value={plateNo} onChange={(e) => setPlateNo(e.target.value)} required />
          <input className="input" placeholder="نوع زيت المحرك" value={engineOilType} onChange={(e) => setEngineOilType(e.target.value)} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "..." : "حفظ"}</button>
      </form>

      <div className="card overflow-x-auto max-h-[65vh] overflow-y-auto">
        <table className="w-full text-sm text-right">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b text-gray-500">
              <th className="py-2">الاسم</th><th>اللوحة</th><th>نوع الزيت</th><th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="py-2">{t.name}</td>
                <td>{t.plateNo}</td>
                <td>{t.engineOilType || "-"}</td>
                <td>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
