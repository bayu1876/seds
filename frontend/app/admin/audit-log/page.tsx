"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface AuditLog {
  id: string;
  user_id: string | null;
  document_id: string | null;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  description: string | null;
  created_at: string;
}

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await api.get("/audit-log/user?page=1&limit=50");
        setItems(result.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load audit log");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading audit log...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
        <p className="text-slate-600 mt-1">
          System audit trail for all actions.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Document</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Description</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                    {item.action}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {item.user_id || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {item.document_id || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {item.description || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 text-center">
                    {new Date(item.created_at).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No audit log entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
