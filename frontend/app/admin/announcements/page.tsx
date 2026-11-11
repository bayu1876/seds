"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Can } from "@/lib/permissions";

interface Announcement {
  id: string;
  title: string | null;
  content: string;
  is_active: boolean;
  display_order: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

function fmt(d: string | null) {
  if (!d) return "-";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "-" : dt.toLocaleString("id-ID");
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const result = await api.get("/announcements");
      setItems(result.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus pengumuman ini?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete announcement");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">Pengumuman penting yang ditampilkan di Dashboard (sesuai masa berlaku).</p>
        </div>
        <Can module="announcement" action="create">
          <Link href="/admin/announcements/create" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors">
            Add Announcement
          </Link>
        </Can>
      </div>

      {error && <div className="mb-6 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">{error}</div>}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Content</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Berlaku</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Order</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 align-top">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.title || "-"}</td>
                <td className="px-4 py-3 text-sm text-slate-700 max-w-md"><p className="line-clamp-3 whitespace-pre-wrap">{item.content}</p></td>
                <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                  <div>Mulai: {fmt(item.starts_at)}</div>
                  <div>Sampai: {fmt(item.ends_at)}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 text-center">{item.display_order}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                    {item.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <Can module="announcement" action="update">
                      <Link href={`/admin/announcements/${item.id}/edit`} className="text-blue-600 hover:text-blue-700 text-sm">Edit</Link>
                    </Can>
                    <Can module="announcement" action="delete">
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                    </Can>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No announcements found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
