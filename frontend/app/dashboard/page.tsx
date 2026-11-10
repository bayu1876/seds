"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface DashboardSection {
  id: string;
  title: string;
  description: string | null;
  documentId: string;
  publicationId?: string | null;
  versionId?: string | null;
  documentNumber: string | null;
  mimeType?: string | null;
  thumbnailPath?: string | null;
  isPublished: boolean;
  createdAt: string;
}

interface DashboardData {
  featuredKnowledge: DashboardSection[];
  recentlyPublished: DashboardSection[];
  myFavorites: DashboardSection[];
  recentlyOpened: DashboardSection[];
}

const API_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:3001/api";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("sed_token") : null;
}

async function fetchThumb(versionId: string): Promise<string | null> {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/document-versions/${versionId}/thumbnail`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>({
    featuredKnowledge: [],
    recentlyPublished: [],
    myFavorites: [],
    recentlyOpened: [],
  });
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await api.get("/dashboard");
        setData(result.data || {
          featuredKnowledge: [],
          recentlyPublished: [],
          myFavorites: [],
          recentlyOpened: [],
        });
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const all = [...data.featuredKnowledge, ...data.recentlyPublished];
    async function loadThumbs() {
      for (const item of all) {
        const key = item.publicationId || item.id;
        if (!item.versionId || !item.thumbnailPath || thumbs[key]) continue;
        const url = await fetchThumb(item.versionId);
        if (cancelled) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        if (url) setThumbs((prev) => (prev[key] ? prev : { ...prev, [key]: url! }));
      }
    }
    loadThumbs();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.featuredKnowledge, data.recentlyPublished]);

  useEffect(() => {
    return () => { Object.values(thumbs).forEach((u) => URL.revokeObjectURL(u)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    try {
      await api.get(`/search/documents?q=${encodeURIComponent(query)}`);
    } catch {}
    router.push(`/documents?q=${encodeURIComponent(query)}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  const renderPubCard = (item: DashboardSection) => {
    const key = item.publicationId || item.id;
    const href = item.publicationId ? `/public-library?publicationId=${item.publicationId}` : `/documents/${item.documentId}`;
    return (
      <Link
        key={key}
        href={href}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all block"
      >
        <div className="aspect-video bg-slate-200 flex items-center justify-center overflow-hidden">
          {thumbs[key] ? (
            <img src={thumbs[key]} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-500 text-sm">
              {(item.mimeType || "").startsWith("video/") ? "Video" : "Dokumen"}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">{item.title}</h3>
          {item.documentNumber && <p className="text-xs text-slate-500 mb-1">{item.documentNumber}</p>}
          {item.description && <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>}
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Find the knowledge you need.</p>
      </div>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search documents, SOP, training, policy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-24 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
            Search
          </button>
        </form>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Featured Knowledge</h2>
            <p className="text-sm text-slate-500">Curated content</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.featuredKnowledge.length > 0 ? (
            data.featuredKnowledge.map(renderPubCard)
          ) : (
            <div className="col-span-3 bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
              <p>No featured knowledge available</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Recently Published</h2>
          <Link href="/public-library" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.recentlyPublished.length > 0 ? (
            data.recentlyPublished.map(renderPubCard)
          ) : (
            <div className="col-span-3 bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
              <p>No recently published documents</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Your saved documents</h3>
          {data.myFavorites.length > 0 ? (
            <ul className="space-y-2">
              {data.myFavorites.map((item) => (
                <li key={item.id}>
                  <Link href={`/documents/${item.documentId}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50">
                    <span className="text-slate-400">★</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 font-medium truncate">{item.title}</p>
                      <p className="text-xs text-slate-400 truncate">{item.documentNumber || ""}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No saved documents</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Recently opened</h3>
          {data.recentlyOpened.length > 0 ? (
            <ul className="space-y-2">
              {data.recentlyOpened.map((item) => (
                <li key={item.id}>
                  <Link href={`/documents/${item.documentId}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50">
                    <span className="text-slate-400">🕒</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 font-medium truncate">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : ""}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No recently opened documents</p>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-8 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
