import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface AuditEntry { id: string; action: string; entityType: string; createdAt: string; user: { fullName: string }; }

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);

  useEffect(() => {
    api.get("/audit-log", { params: { pageSize: 50 } }).then((res) => setLogs(res.data.data.items));
  }, []);

  return (
    <div className="card overflow-x-auto max-h-[70vh] overflow-y-auto">
      <h2 className="font-bold mb-3">سجل التتبع</h2>
      <table className="w-full text-sm text-right">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="border-b text-gray-500"><th className="py-2">المستخدم</th><th>الإجراء</th><th>النوع</th><th>التاريخ</th></tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-b last:border-0">
              <td className="py-2">{l.user.fullName}</td><td>{l.action}</td><td>{l.entityType}</td>
              <td>{new Date(l.createdAt).toLocaleString("ar")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
