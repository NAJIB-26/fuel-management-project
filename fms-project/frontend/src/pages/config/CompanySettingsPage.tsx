import { useState, useEffect, FormEvent } from "react";
import { api, parseApiError } from "../../lib/api";

export default function CompanySettingsPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/config/company").then((res) => {
      const c = res.data.data;
      if (c) { setName(c.name || ""); setAddress(c.address || ""); }
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      await api.put("/config/company", { name, address, phones: [] });
    } catch (err: any) {
      setError(parseApiError(err).message);
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3 max-w-lg">
      <h2 className="font-bold">ترميزات النظام العامة</h2>
      {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
      <input className="input" placeholder="اسم الشركة" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="input" placeholder="العنوان" value={address} onChange={(e) => setAddress(e.target.value)} />
      <button type="submit" disabled={saving} className="btn-primary">{saving ? "..." : "حفظ"}</button>
    </form>
  );
}
