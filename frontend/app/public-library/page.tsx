"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface PublicationItem {
  id: string;
  title: string;
  documentNumber: string | null;
  description: string | null;
  department: string;
  category: string;
  publishedAt: string | null;
  isPublished: boolean;
  featured: boolean;
}

export default function PublicLibraryPage() {
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await api.get("/public-library");
        setPublications(result.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load public library");
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
        <p className="mt-4 text-slate-600">Loading public library...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Public Library</h1>
        <p className="text-slate-600 mt-1">
          Curated knowledge portal from published documents.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publications.length > 0 ? (
          publications.map((pub) => (
            <div
              key={pub.id}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                📖
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 truncate">
                {pub.title}
              </h3>
              {pub.documentNumber && (
                <p className="text-xs text-slate-500 mb-3">#{pub.documentNumber}</p>
              )}
              {pub.description && (
                <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-1">
                  {pub.description}
                </p>
              )}
              <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                  {pub.department}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    pub.isPublished
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {pub.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
            No published documents in the public library
          </div>
        )}
      </div>
    </div>
  );
}
