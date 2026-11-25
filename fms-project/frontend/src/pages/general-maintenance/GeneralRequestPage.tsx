import { useEffect, useState, FormEvent } from "react";
import { api, parseApiError } from "../../lib/api";

interface Truck { id: string; name: string; plateNo: string; }
interface Req { id: string; requestNo: number; faultType: string; estimatedCost: number; approvalL1: string; approvalL2: string; truck?: { name: string; plateNo: string }; }

export default function GeneralRequestPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [requests, setRequests] = useState<Req[]>([]);
  const [truckId, setTruckId] = useState("");
  const [currentOdometer, setCurrentOdometer] = useState(0);
  const [faultType, setFaultType] = useState("");
  const [faultDescription, setFaultDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [t, r] = await Promise.all([
      api.get("/trucks", { params: { pageSize: 50 } }),
      api.get("/general-maintenance", { params: { pageSize: 50 } }),
    ]);
    setTrucks(t.data.data.items);
    setRequests(r.data.data.items);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      await api.post("/general-maintenance", {
        truckId, currentOdometer: Number(currentOdometer), faultType, faultDescription,
        estimatedCost: Number(estimatedCost), date: new Date(date).toISOString(),
      });
      setCurrentOdometer(0); setFaultType(""); setFaultDescription(""); setEstimatedCost(0);
      await load();
    } catch (err: any) {
      setError(parseApiError(err).message);
    } finally { setSaving(false); }
  }

  async function approve(id: string, level: "L1" | "L2") {
    try {
      await api.post(`/general-maintenance/${id}/approve`, { level, status: "APPROVED" });
      await load();
    } catch (err: any) {
      setError(parseApiError(err).message);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="font-bold">طلب صيانة عامة</h2>
        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs mb-1">التاريخ</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs mb-1">الشاحنة</label>
            <select className="input" value={truckId} onChange={(e) => setTruckId(e.target.value)} required>
              <option value="">اختر</option>
              {trucks.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.plateNo}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">العداد الحالي</label>
            <input type="number" className="input" value={currentOdometer} onChange={(e) => setCurrentOdometer(Number(e.target.value))} required />
          </div>
          <div>
            <label className="block text-xs mb-1">نوع الخلل</label>
            <input className="input" value={faultType} onChange={(e) => setFaultType(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs mb-1">وصف الخلل</label>
            <textarea className="input" value={faultDescription} onChange={(e) => setFaultDescription(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs mb-1">التكلفة المتوقعة</label>
            <input type="number" className="input" value={estimatedCost} onChange={(e) => setEstimatedCost(Number(e.target.value))} required />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "..." : "حفظ"}</button>
      </form>

      <div className="card overflow-x-auto max-h-[65vh] overflow-y-auto relative">
        <table className="w-full text-sm text-right">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr className="border-b text-gray-500">
              <th className="py-2">رقم الطلب</th><th>الشاحنة</th><th>نوع الخلل</th><th>التكلفة</th><th>مستوى1</th><th>مستوى2</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2">{r.requestNo}</td>
                <td>{r.truck?.name} ({r.truck?.plateNo})</td>
                <td>{r.faultType}</td>
                <td>{r.estimatedCost}</td>
                <td><button onClick={() => approve(r.id, "L1")} className="text-xs px-2 py-0.5 rounded bg-gray-100">{r.approvalL1}</button></td>
                <td><button onClick={() => approve(r.id, "L2")} className="text-xs px-2 py-0.5 rounded bg-gray-100">{r.approvalL2}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
