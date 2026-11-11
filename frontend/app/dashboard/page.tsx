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
  latestMemo: DashboardSection[];
  featuredKnowledge: DashboardSection[];
  recentlyPublished: DashboardSection[];
  myFavorites: DashboardSection[];
  recentlyOpened: DashboardSection[];
}

const API_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "/api";

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
    latestMemo: [],
    featuredKnowledge: [],
    recentlyPublished: [],
    myFavorites: [],
    recentlyOpened: [],
  });
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [announcements, setAnnouncements] = useState<{ id: string; title: string | null; content: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [result, annRes] = await Promise.all([
          api.get("/dashboard"),
          api.get("/announcements/active").catch(() => ({ data: [] })),
        ]);
        setData(result.data || {
          latestMemo: [],
          featuredKnowledge: [],
          recentlyPublished: [],
          myFavorites: [],
          recentlyOpened: [],
        });
        setAnnouncements(annRes?.data || []);
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
    const all = [...data.latestMemo, ...data.featuredKnowledge, ...data.recentlyPublished];
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
  }, [data.latestMemo, data.featuredKnowledge, data.recentlyPublished]);

  useEffect(() => {
    return () => { Object.values(thumbs).forEach((u) => URL.revokeObjectURL(u)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await api.get(`/search/documents?q=${encodeURIComponent(query)}&limit=8`);
        if (!cancelled) {
          setSearchResults(res.data || []);
        }
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setShowResults(false);
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
    const href = `/documents/${item.documentId}/view`;
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

      {announcements.length > 0 && (
        <div className="mb-6 space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-200 text-amber-800 text-sm font-bold shrink-0" aria-hidden="true">!</span>
                <div className="min-w-0">
                  {a.title ? <p className="text-sm font-semibold text-amber-900 mb-1">{a.title}</p> : null}
                  <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">{a.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search documents, SOP, training, policy..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
            className="w-full pl-10 pr-24 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
            Search
          </button>

          {showResults && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg z-20 overflow-hidden">
              {searching ? (
                <div className="px-4 py-3 text-sm text-slate-500">Mencari...</div>
              ) : searchResults.length > 0 ? (
                <div>
                  <ul className="max-h-96 overflow-auto">
                    {searchResults.map((doc: any) => (
                      <li key={doc.id} className="border-b border-slate-100 last:border-b-0">
                        <Link
                          href={`/documents/${doc.id}/view`}
                          className="block px-4 py-3 hover:bg-slate-50"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setShowResults(false)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{doc.title || "Untitled"}</p>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">
                                {[doc.document_number, doc.department?.name, doc.category?.name].filter(Boolean).join(" · ") || "Dokumen"}
                              </p>
                              {doc.description ? (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{doc.description}</p>
                              ) : null}
                            </div>
                            <span className="text-xs text-blue-600 whitespace-nowrap">Lihat</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Hasil untuk &quot;{searchQuery.trim()}&quot;</span>
                    <Link
                      href={`/documents?q=${encodeURIComponent(searchQuery.trim())}`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowResults(false)}
                    >
                      Lihat semua hasil →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3">
                  <p className="text-sm text-slate-500">Tidak ada hasil untuk &quot;{searchQuery.trim()}&quot;</p>
                  <Link
                    href={`/documents?q=${encodeURIComponent(searchQuery.trim())}`}
                    className="inline-block mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowResults(false)}
                  >
                    Buka pencarian di Documents →
                  </Link>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-sm font-extrabold" aria-hidden="true">!</span>
              MEMO Terbaru
            </h2>
            <p className="text-sm text-slate-500">Memo terbaru dari kategori IOM</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.latestMemo.length > 0 ? (
            data.latestMemo.map(renderPubCard)
          ) : (
            <div className="col-span-3 bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
              <p>Tidak ada MEMO terbaru</p>
            </div>
          )}
        </div>
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
                  <Link href={`/documents/${item.documentId}/view`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50">
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
                  <Link href={`/documents/${item.documentId}/view`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50">
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
