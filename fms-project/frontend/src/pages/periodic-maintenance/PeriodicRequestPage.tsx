import { useEffect, useState, FormEvent } from "react";
import { api, parseApiError } from "../../lib/api";

const KINDS = [
  { value: "ENGINE_OIL", label: "زيت المحرك" }, { value: "GEARBOX_OIL", label: "زيت القير" },
  { value: "DIFFERENTIAL_OIL", label: "زيت الاسبيت" }, { value: "POWER_STEERING_OIL", label: "زيت السكان" },
  { value: "BRAKE_PAD", label: "سم البريك" }, { value: "OIL_FILTER", label: "فلتر الزيت" },
  { value: "DIESEL_FILTER", label: "فلتر الديزل" }, { value: "DIESEL_FILTER_METAL", label: "فلتر ديزل حديد" },
  { value: "AIR_FILTER", label: "فلتر الهواء" }, { value: "RADIATOR_WATER", label: "ماء الاديتر" },
  { value: "TIRES", label: "الكفرات" }, { value: "WASHING", label: "الغسيل" }, { value: "PERIODIC_INSPECTION", label: "الفحص الدوري" },
];

interface Truck { id: string; name: string; plateNo: string; }
interface Req { id: string; requestNo: number; kind: string; odometerDiff: number; withinLimit: boolean; approvalL1: string; approvalL2: string; truck?: { name: string; plateNo: string }; }

export default function PeriodicRequestPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [requests, setRequests] = useState<Req[]>([]);
  const [truckId, setTruckId] = useState("");
  const [kind, setKind] = useState("ENGINE_OIL");
  const [currentOdometer, setCurrentOdometer] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [t, r] = await Promise.all([
      api.get("/trucks", { params: { pageSize: 50, status: "ACTIVE" } }),
      api.get("/periodic-maintenance", { params: { pageSize: 50 } }),
    ]);
    setTrucks(t.data.data.items);
    setRequests(r.data.data.items);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      await api.post("/periodic-maintenance", {
        truckId, kind, currentOdometer: Number(currentOdometer), quantity: Number(quantity), unit: "لتر",
        date: new Date(date).toISOString(),
      });
      setCurrentOdometer(0); setQuantity(0);
      await load();
    } catch (err: any) {
      setError(parseApiError(err).message);
    } finally { setSaving(false); }
  }

  async function approve(id: string, level: "L1" | "L2") {
    await api.post(`/periodic-maintenance/${id}/approve`, { level, status: "APPROVED" });
    await load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="font-bold">طلب صيانة دورية</h2>
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
            <label className="block text-xs mb-1">نوع الصيانة</label>
            <select className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
              {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">العداد الحالي</label>
            <input type="number" className="input" value={currentOdometer} onChange={(e) => setCurrentOdometer(Number(e.target.value))} required />
          </div>
          <div>
            <label className="block text-xs mb-1">الكمية</label>
            <input type="number" className="input" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "..." : "حفظ"}</button>
      </form>

      <div className="card overflow-x-auto max-h-[65vh] overflow-y-auto relative">
        <table className="w-full text-sm text-right">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr className="border-b text-gray-500">
              <th className="py-2">رقم الطلب</th><th>الشاحنة</th><th>النوع</th><th>الفارق</th><th>الحالة</th><th>مستوى1</th><th>مستوى2</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2">{r.requestNo}</td>
                <td>{r.truck?.name} ({r.truck?.plateNo})</td>
                <td>{KINDS.find((k) => k.value === r.kind)?.label || r.kind}</td>
                <td>{r.odometerDiff}</td>
                <td className={r.withinLimit ? "text-green-600" : "text-red-600"}>{r.withinLimit ? "ضمن الحد" : "تجاوز"}</td>
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
