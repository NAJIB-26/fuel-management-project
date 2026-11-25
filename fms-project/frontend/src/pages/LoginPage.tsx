import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, parseApiError } from "../lib/api";
import { useAuthStore } from "../lib/authStore";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const setPermissions = useAuthStore((s) => s.setPermissions);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      const { accessToken, user } = res.data.data;
      setSession(accessToken, user); // token must be in store before calling /auth/me

      const meRes = await api.get("/auth/me");
      const me = meRes.data.data;
      setSession(accessToken, { ...user, managedBy: me.managedBy ?? null });
      setPermissions(me.permissions);

      navigate("/dashboard");
    } catch (err: any) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-lg font-bold text-center text-primary-dark">تسجيل الدخول - نظام المحروقات والصيانة</h1>
        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
        <div>
          <label className="block text-sm mb-1">اسم المستخدم</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">كلمة المرور</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "جاري الدخول..." : "دخول"}
        </button>
        <p className="text-xs text-gray-400 text-center">admin / Admin@12345</p>
      </form>
    </div>
  );
}
