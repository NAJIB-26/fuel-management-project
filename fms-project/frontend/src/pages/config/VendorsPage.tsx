import { useEffect, useState, FormEvent } from "react";
import { api, parseApiError } from "../../lib/api";

interface Vendor { id: string; name: string; type: string; address?: string; }

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("FUEL_STATION");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await api.get("/config/vendors");
    setVendors(res.data.data);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/config/vendors", { name, type });
      setName(""); await load();
    } catch (err: any) { setError(parseApiError(err).message); }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <form onSubmit={handleSubmit} className="card space-y-3 h-fit">
        <h2 className="font-bold">إضافة مورد</h2>
        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
        <input className="input" placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)} required />
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="FUEL_STATION">محطة وقود</option>
          <option value="WORKSHOP">ورشة صيانة</option>
        </select>
        <button type="submit" className="btn-primary">حفظ</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead><tr className="border-b text-gray-500"><th className="py-2">الاسم</th><th>النوع</th></tr></thead>
          <tbody>{vendors.map((v) => <tr key={v.id} className="border-b last:border-0"><td className="py-2">{v.name}</td><td>{v.type}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
