"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AnnouncementsCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: "", content: "", display_order: "0", is_active: true, starts_at: "", ends_at: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    if (!formData.content.trim()) { setError("Content is required"); setLoading(false); return; }
    try {
      await api.post("/announcements", {
        title: formData.title.trim() || null,
        content: formData.content.trim(),
        display_order: Number(formData.display_order) || 0,
        is_active: formData.is_active,
        starts_at: formData.starts_at || null,
        ends_at: formData.ends_at || null,
      });
      router.push("/admin/announcements");
    } catch (err: any) {
      setError(err.message || "Failed to create announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/announcements" className="text-sm text-blue-600 hover:text-blue-700">← Back to Announcements</Link>
        <h1 className="text-2xl font-bold text-slate-900">Create Announcement</h1>
      </div>
      {error && <div className="mb-6 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">{error}</div>}
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title (opsional)</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Judul pengumuman" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content *</label>
            <textarea rows={5} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Isi pengumuman..." required />
            <p className="text-xs text-slate-500 mt-1">Box di dashboard akan menyesuaikan ukuran isi.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mulai Berlaku (opsional)</label>
              <input type="datetime-local" value={formData.starts_at} onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Berakhir (opsional)</label>
              <input type="datetime-local" value={formData.ends_at} onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <p className="text-xs text-slate-500 mt-1">Kosongkan jika tanpa batas. Pengumuman otomatis tidak tampil di luar masa berlaku.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
              <input type="number" min={0} value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                Active (tampilkan di Dashboard)
              </label>
            </div>
          </div>
          <button type="submit" disabled={loading} className="py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-medium">
            {loading ? "Creating..." : "Create Announcement"}
          </button>
        </form>
      </div>
    </div>
  );
}
