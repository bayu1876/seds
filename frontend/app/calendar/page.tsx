"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
}

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildGrid(current: Date) {
  const first = startOfMonth(current);
  const startWeekday = first.getDay(); // 0 Sun
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startWeekday);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  return cells;
}

export default function CalendarPage() {
  const { has } = usePermissions();
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/calendar");
      setEvents(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load calendar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cells = useMemo(() => buildGrid(current), [current]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const d = new Date(ev.starts_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const monthLabel = current.toLocaleString("id-ID", { month: "long", year: "numeric" });

  const prevMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const nextMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  const today = () => setCurrent(new Date());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Kalender kegiatan hotel.</p>
        </div>
        <div className="flex items-center gap-2">
          <Can module="calendar" action="create">
            <Link href="/calendar/create" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors">
              Add Event
            </Link>
          </Can>
        </div>
      </div>

      {error && <div className="mb-6 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">{error}</div>}

      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4 flex items-center justify-between">
        <button onClick={prevMonth} className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50 text-sm">‹ Prev</button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900 capitalize">{monthLabel}</h2>
          <button onClick={today} className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50 text-xs">Today</button>
        </div>
        <button onClick={nextMonth} className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50 text-sm">Next ›</button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {WEEKDAYS.map((w) => (
            <div key={w} className="px-2 py-2 text-center text-xs font-semibold text-slate-500 uppercase">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, idx) => {
            const inMonth = d.getMonth() === current.getMonth();
            const isToday = sameDay(d, new Date());
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const dayEvents = eventsByDay.get(key) || [];
            return (
              <div
                key={idx}
                className={`min-h-[110px] border-b border-r border-slate-100 p-1.5 ${inMonth ? "bg-white" : "bg-slate-50"} ${isToday ? "ring-1 ring-blue-400" : ""}`}
              >
                <div className={`text-xs font-medium mb-1 ${inMonth ? "text-slate-700" : "text-slate-400"} ${isToday ? "text-blue-600" : ""}`}>
                  {d.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.map((ev) => (
                    <Link
                      key={ev.id}
                      href={`/calendar/${ev.id}`}
                      className="block text-[11px] px-1.5 py-0.5 rounded truncate hover:opacity-80"
                      style={{ backgroundColor: ev.color || "#3B82F6", color: "#fff" }}
                      title={ev.title}
                    >
                      {ev.all_day ? "" : new Date(ev.starts_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " "}{ev.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
