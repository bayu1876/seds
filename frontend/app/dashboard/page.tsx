"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface DashboardSection {
  id: string;
  title: string;
  description: string | null;
  documentId: string;
  documentNumber: string | null;
  isPublished: boolean;
  createdAt: string;
}

interface DashboardData {
  featuredKnowledge: DashboardSection[];
  recentlyPublished: DashboardSection[];
  myFavorites: DashboardSection[];
  recentlyOpened: DashboardSection[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    featuredKnowledge: [],
    recentlyPublished: [],
    myFavorites: [],
    recentlyOpened: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await api.get("/dashboard");
        setData(result.data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const badgeClass = (isPublished: boolean) =>
    isPublished
      ? "bg-green-100 text-green-700"
      : "bg-slate-100 text-slate-600";

  const renderSection = (
    title: string,
    items: DashboardSection[],
    icon: string,
  ) => (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
                {item.isPublished ? "📢" : "📄"}
              </div>
              <h3 className="font-semibold text-slate-900 truncate">
                {item.title}
              </h3>
              {item.documentNumber && (
                <p className="text-xs text-slate-500 mt-1">
                  #{item.documentNumber}
                </p>
              )}
              {item.description && (
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${badgeClass(
                    item.isPublished,
                  )}`}
                >
                  {item.isPublished ? "Published" : "Draft"}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
            Empty state - no data available
          </div>
        )}
      </div>
    </section>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Working Dashboard - Featured, Published, Favorites, Recently Opened
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          {renderSection("Featured Knowledge", data.featuredKnowledge, "📢")}
        </div>
        <div>
          {renderSection("Recently Published", data.recentlyPublished, "📢")}
        </div>
        <div>
          {renderSection("My Favorites", data.myFavorites, "⭐")}
        </div>
        <div>
          {renderSection("Recently Opened", data.recentlyOpened, "🕒")}
        </div>
      </div>
    </div>
  );
}
