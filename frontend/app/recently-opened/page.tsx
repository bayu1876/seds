"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface RecentItem {
  id: string;
  title: string;
  documentNumber: string | null;
  documentId: string;
  viewedAt: string;
}

export default function RecentlyOpenedPage() {
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await api.get("/recent-view");
        setRecent(result.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load recent views");
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
        <p className="mt-4 text-slate-600">Loading recently opened...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Recently Opened</h1>
        <p className="text-slate-600 mt-1">
          Your recently accessed documents.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {recent.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {recent.map((item) => (
              <li key={item.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/documents/${item.documentId}`} className="text-sm font-medium text-slate-900 hover:text-blue-600">
                      {item.title}
                    </Link>
                    {item.documentNumber && (
                      <p className="text-xs text-slate-500 mt-0.5">#{item.documentNumber}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(item.viewedAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <span className="text-2xl mb-2">🕒</span>
            <p className="text-sm">No recently opened documents</p>
          </div>
        )}
      </div>
    </div>
  );
}
