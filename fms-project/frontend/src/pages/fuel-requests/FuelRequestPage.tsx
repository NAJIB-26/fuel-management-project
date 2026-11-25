import { useEffect, useState, FormEvent } from "react";
import { api, parseApiError } from "../../lib/api";
import { useAuthStore } from "../../lib/authStore";

interface Truck { id: string; name: string; plateNo: string; }
interface FuelRequest {
  id: string; requestNo: number; date: string; requestedQuantity: number; unitPrice: number;
  totalAmount: number; odometerDiff: number; truck?: { name: string; plateNo: string };
}

function todayISO() { return new Date().toISOString().slice(0, 10); }

export default function FuelRequestPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [truckId, setTruckId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [currentOdometer, setCurrentOdometer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const directManager = useAuthStore((s) => s.user?.managedBy);

  async function load() {
    const [t, r] = await Promise.all([
      api.get("/trucks", { params: { pageSize: 50, status: "ACTIVE" } }),
      api.get("/fuel-requests", { params: { pageSize: 50 } }),
    ]);
    setTrucks(t.data.data.items);
    setRequests(r.data.data.items);
  }
  useEffect(() => { load(); }, []);

  const totalAmount = quantity * unitPrice;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      await api.post("/fuel-requests", {
        truckId, fuelType: "DIESEL", requestedQuantity: Number(quantity), unit: "لتر",
        unitPrice: Number(unitPrice), currentOdometer: Number(currentOdometer),
        date: new Date(date).toISOString(),
      });
      setQuantity(0); setUnitPrice(0); setCurrentOdometer(0); setDate(todayISO());
      await load();
    } catch (err: any) {
      setError(parseApiError(err).message);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="font-bold">طلب صرف محروقات</h2>
        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs mb-1">التاريخ</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs mb-1">المسؤول المباشر (آلي)</label>
            <input className="input bg-gray-50" value={directManager?.fullName || "—"} disabled />
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
            <label className="block text-xs mb-1">الكمية</label>
            <input type="number" className="input" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
          </div>
          <div>
            <label className="block text-xs mb-1">سعر الوحدة</label>
            <input type="number" step="0.01" className="input" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} required />
          </div>
          <div>
            <label className="block text-xs mb-1">المبلغ الإجمالي (آلي)</label>
            <input className="input bg-gray-50 font-semibold" value={totalAmount.toFixed(2)} disabled />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "..." : "حفظ"}</button>
      </form>

      <div className="card overflow-x-auto max-h-[65vh] overflow-y-auto relative">
        <table className="w-full text-sm text-right">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr className="border-b text-gray-500">
              <th className="py-2">رقم الطلب</th><th>الشاحنة</th><th>التاريخ</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th><th>الفارق</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2">{r.requestNo}</td>
                <td>{r.truck?.name} ({r.truck?.plateNo})</td>
                <td>{new Date(r.date).toLocaleDateString("ar")}</td>
                <td>{r.requestedQuantity}</td>
                <td>{r.unitPrice}</td>
                <td className="font-semibold">{r.totalAmount}</td>
                <td>{r.odometerDiff}</td>
              </tr>
            ))}
            {requests.length === 0 && <tr><td colSpan={7} className="py-4 text-center text-gray-400">لا توجد طلبات</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
