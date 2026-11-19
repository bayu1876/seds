"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function CalendarCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    starts_at: "",
    ends_at: "",
    all_day: false,
    color: "#3B82F6",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    if (!formData.title.trim()) { setError("Title is required"); setLoading(false); return; }
    if (!formData.starts_at) { setError("Start date is required"); setLoading(false); return; }
    try {
      await api.post("/calendar", {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        location: formData.location.trim() || null,
        starts_at: formData.starts_at,
        ends_at: formData.ends_at || null,
        all_day: formData.all_day,
        color: formData.color || null,
        is_active: formData.is_active,
      });
      router.push("/calendar");
    } catch (err: any) {
      setError(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/calendar" className="text-sm text-blue-600 hover:text-blue-700">← Back to Calendar</Link>
        <h1 className="text-2xl font-bold text-slate-900">Create Event</h1>
      </div>
      {error && <div className="mb-6 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">{error}</div>}
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start *</label>
              <input type="datetime-local" value={formData.starts_at} onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End</label>
              <input type="datetime-local" value={formData.ends_at} onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
              <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-16 h-10 border border-slate-300 rounded-md" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={formData.all_day} onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                All day
              </label>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                Active
              </label>
            </div>
          </div>
          <button type="submit" disabled={loading} className="py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-medium">
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}
