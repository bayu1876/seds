"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Can, usePermissions } from "@/lib/permissions";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  color: string | null;
  is_active: boolean;
  created_at: string;
}

function fmt(d: string | null, allDay = false) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  if (allDay) return dt.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  return dt.toLocaleString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function CalendarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { has } = usePermissions();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/calendar/${id}`);
        setEvent(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Hapus kegiatan ini?")) return;
    try {
      await api.delete(`/calendar/${id}`);
      router.push("/calendar");
    } catch (err: any) {
      setError(err.message || "Failed to delete event");
    }
  };

  if (loading) return <div className="p-6 text-slate-600">Loading...</div>;
  if (!event) return <div className="p-6 text-red-600">{error || "Event not found"}</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <Link href="/calendar" className="text-sm text-blue-600 hover:text-blue-700">← Back to Calendar</Link>
        <h1 className="text-2xl font-bold text-slate-900">Event Detail</h1>
      </div>

      {error && <div className="mb-6 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">{error}</div>}

      <div className="bg-white rounded-lg border border-slate-200 p-8 space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: event.color || "#3B82F6" }} />
          <h2 className="text-xl font-semibold text-slate-900">{event.title}</h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
            {event.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {event.description && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Description</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Mulai</p>
            <p className="text-sm text-slate-700">{fmt(event.starts_at, event.all_day)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Selesai</p>
            <p className="text-sm text-slate-700">{fmt(event.ends_at, event.all_day)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Lokasi</p>
            <p className="text-sm text-slate-700">{event.location || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">All Day</p>
            <p className="text-sm text-slate-700">{event.all_day ? "Ya" : "Tidak"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Can module="calendar" action="update">
            <Link href={`/calendar/${event.id}/edit`} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">Edit</Link>
          </Can>
          <Can module="calendar" action="delete">
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium">Delete</button>
          </Can>
        </div>
      </div>
    </div>
  );
}
