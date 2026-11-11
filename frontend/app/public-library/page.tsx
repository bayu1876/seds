"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { usePermissions } from "@/lib/permissions";

interface PublicationItem {
  id: string;
  document_id: string;
  version_id?: string;
  document_number: string | null;
  title: string;
  description: string | null;
  department_name: string | null;
  category_name: string | null;
  mime_type?: string | null;
  thumbnail_path?: string | null;
  tags?: string[];
  is_published: boolean;
  featured: boolean;
  display_order: number;
  published_at: string | null;
}

interface Version {
  id: string;
  version_number: number;
  original_filename: string;
  mime_type: string;
  file_size: number;
  is_current: boolean;
  thumbnail_path?: string | null;
}

const API_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "/api";

const VIEWED_KEY = "seds_public_library_viewed";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("sed_token") : null;
}

async function fetchBlobUrl(path: string): Promise<string | null> {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

function publishedTime(item: PublicationItem) {
  return item.published_at ? new Date(item.published_at).getTime() : 0;
}

function tokenize(s: string | null | undefined) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function getViewedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function addViewedId(id: string) {
  if (typeof window === "undefined") return;
  const ids = [id, ...getViewedIds().filter((x) => x !== id)].slice(0, 30);
  localStorage.setItem(VIEWED_KEY, JSON.stringify(ids));
}

export default function PublicLibraryPage() {
  const searchParams = useSearchParams();
  const { has } = usePermissions();
  const canViewVersions = has("document_version", "view");
  const targetPublicationId = searchParams.get("publicationId") || searchParams.get("id");
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<PublicationItem | null>(null);
  const [version, setVersion] = useState<Version | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});
  const [selectedThumbUrl, setSelectedThumbUrl] = useState<string | null>(null);
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [favoriteDocIds, setFavoriteDocIds] = useState<Set<string>>(new Set());
  const [favBusy, setFavBusy] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setViewedIds(getViewedIds());
  }, []);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const res = await api.get("/favorite?limit=200");
        const items = res.data || [];
        const ids = new Set<string>();
        for (const f of items) {
          const did = f.document_id || f.document?.id;
          if (did) ids.add(did);
        }
        setFavoriteDocIds(ids);
      } catch {
        // ignore if not permitted
      }
    }
    loadFavorites();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const result = await api.get("/public-library");
        const items: PublicationItem[] = result.data || [];
        setPublications(items);
        if (items.length > 0) {
          const target = targetPublicationId ? items.find((i) => i.id === targetPublicationId) : null;
          if (target) {
            setSelected(target);
          } else {
            const videos = items
              .filter((i) => (i.mime_type || "").startsWith("video/"))
              .sort((a, b) => publishedTime(b) - publishedTime(a));
            const latestOverall = [...items].sort((a, b) => publishedTime(b) - publishedTime(a))[0];
            setSelected(videos[0] || latestOverall || items[0]);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load public library");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [targetPublicationId]);

  // load thumbnails for all items
  useEffect(() => {
    let cancelled = false;
    async function loadThumbs() {
      for (const item of publications) {
        if (!item.version_id || !item.thumbnail_path) continue;
        const url = await fetchBlobUrl(`/document-versions/${item.version_id}/thumbnail`);
        if (cancelled) { if (url) URL.revokeObjectURL(url); return; }
        if (url) {
          setThumbUrls((prev) => {
            if (prev[item.id]) { URL.revokeObjectURL(url); return prev; }
            return { ...prev, [item.id]: url };
          });
        }
      }
    }
    loadThumbs();
    return () => { cancelled = true; };
  }, [publications]);

  useEffect(() => {
    return () => { Object.values(thumbUrls).forEach((u) => URL.revokeObjectURL(u)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return;
    addViewedId(selected.id);
    setViewedIds(getViewedIds());

    let active = true;
    let localUrl: string | null = null;
    let localThumb: string | null = null;

    if (!canViewVersions) {
      setVersion(null);
      setMediaUrl(null);
      setSelectedThumbUrl(null);
      setMediaLoading(false);
      return;
    }

    async function loadMedia() {
      setMediaLoading(true);
      setVersion(null);
      if (mediaUrl) { URL.revokeObjectURL(mediaUrl); setMediaUrl(null); }
      if (selectedThumbUrl) { URL.revokeObjectURL(selectedThumbUrl); setSelectedThumbUrl(null); }
      try {
        const versionsResult = await api.get(`/document-versions/${selected!.document_id}`);
        const versions: Version[] = versionsResult.data || [];
        const current = versions.find((v) => v.is_current) || versions[0] || null;
        setVersion(current);
        if (current) {
          if (current.thumbnail_path) {
            const turl = await fetchBlobUrl(`/document-versions/${current.id}/thumbnail`);
            if (!active) { if (turl) URL.revokeObjectURL(turl); }
            else if (turl) { localThumb = turl; setSelectedThumbUrl(turl); }
          }
          const url = await fetchBlobUrl(`/document-versions/${current.id}/download`);
          if (!active) { if (url) URL.revokeObjectURL(url); return; }
          localUrl = url; setMediaUrl(url);
        }
      } catch (err: any) {
        if (active) setError(err.message || "Failed to load preview");
      } finally {
        if (active) setMediaLoading(false);
      }
    }
    loadMedia();

    return () => {
      active = false;
      if (localUrl) URL.revokeObjectURL(localUrl);
      if (localThumb) URL.revokeObjectURL(localThumb);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, canViewVersions]);

  const latestFirst = useMemo(
    () => [...publications].sort((a, b) => publishedTime(b) - publishedTime(a)),
    [publications]
  );

  const related = useMemo(() => {
    if (!selected) return [];
    const selTags = new Set((selected.tags || []).map((t) => t.toLowerCase()));
    const selTokens = new Set(tokenize(`${selected.title} ${selected.description || ""}`));
    return publications
      .filter((p) => p.id !== selected.id)
      .map((p) => {
        const tags = (p.tags || []).map((t) => t.toLowerCase());
        let score = 0;
        for (const t of tags) if (selTags.has(t)) score += 5;
        const tokens = tokenize(`${p.title} ${p.description || ""}`);
        for (const t of tokens) if (selTokens.has(t)) score += 1;
        if (p.category_name && selected.category_name && p.category_name === selected.category_name) score += 1;
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || publishedTime(b.p) - publishedTime(a.p))
      .slice(0, 10)
      .map((x) => x.p);
  }, [publications, selected]);

  const recentlyViewed = useMemo(() => {
    const map = new Map(publications.map((p) => [p.id, p]));
    return viewedIds
      .map((id) => map.get(id))
      .filter((p): p is PublicationItem => !!p && p.id !== selected?.id)
      .slice(0, 10);
  }, [viewedIds, publications, selected?.id]);

  const handleToggleFavorite = async () => {
    if (!selected) return;
    setFavBusy(true);
    try {
      const res = await api.post("/favorite", { document_id: selected.document_id });
      const isFav = !!res.data?.isFavorite;
      setFavoriteDocIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(selected.document_id); else next.delete(selected.document_id);
        return next;
      });
    } catch (err: any) {
      setError(err.message || "Failed to update favorite");
    } finally {
      setFavBusy(false);
    }
  };

  const scrollCarousel = (dir: number) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.8), behavior: "smooth" });
  };

  const isVideo = version?.mime_type?.startsWith("video/");
  const isAudio = version?.mime_type?.startsWith("audio/");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading public library...</p>
      </div>
    );
  }

  const Thumb = ({ item, className = "w-28 h-16" }: { item: PublicationItem; className?: string }) => (
    <div className={`${className} bg-slate-200 rounded overflow-hidden flex-shrink-0 flex items-center justify-center`}>
      {thumbUrls[item.id] ? (
        <img src={thumbUrls[item.id]} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-[10px] text-slate-500 px-1 text-center">
          {(item.mime_type || "").startsWith("video/") ? "Video" : "Doc"}
        </span>
      )}
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-slate-900 text-white py-6 px-6 mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Public Library</h1>
          <p className="text-slate-400 text-sm">Curated Knowledge Portal</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pb-12 space-y-8">
        {/* Main player */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              {mediaLoading ? (
                <div className="text-white">Loading preview...</div>
              ) : mediaUrl ? (
                isVideo ? (
                  <video src={mediaUrl} controls poster={selectedThumbUrl || undefined} className="w-full h-full" />
                ) : isAudio ? (
                  <audio src={mediaUrl} controls className="w-full max-w-md" />
                ) : (
                  <iframe src={mediaUrl} className="w-full h-full bg-white" title={selected?.title || "Preview"} />
                )
              ) : (
                <div className="text-white text-center px-4">
                  <p>
                    {canViewVersions
                      ? "No preview available"
                      : "Pratinjau tidak tersedia untuk akun Anda"}
                  </p>
                </div>
              )}
            </div>
            {selected && (
              <div className="mt-4 bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-xl font-bold text-slate-900">{selected.title}</h2>
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    disabled={favBusy}
                    className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      favoriteDocIds.has(selected.document_id)
                        ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                        : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                    } disabled:opacity-50`}
                    title={favoriteDocIds.has(selected.document_id) ? "Hapus dari Favorit" : "Tambahkan ke Favorit"}
                  >
                    <span aria-hidden="true">{favoriteDocIds.has(selected.document_id) ? "★" : "☆"}</span>
                    {favoriteDocIds.has(selected.document_id) ? "Favorit" : "Tambah Favorit"}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-3">
                  {selected.department_name && <span>{selected.department_name}</span>}
                  {selected.category_name && <span>• {selected.category_name}</span>}
                  {selected.document_number && <span>• #{selected.document_number}</span>}
                  {selected.published_at && <span>• {new Date(selected.published_at).toLocaleDateString("id-ID")}</span>}
                </div>
                {(selected.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(selected.tags || []).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{t}</span>
                    ))}
                  </div>
                )}
                {selected.description && <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.description}</p>}
              </div>
            )}
          </div>

          {/* Related (correlated, max 10) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Terkait</h3>
                <span className="text-xs text-slate-500">maks. 10</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
                {related.length > 0 ? related.map((item) => (
                  <button key={item.id} onClick={() => setSelected(item)} className={`w-full text-left px-3 py-3 hover:bg-slate-50 transition-colors flex gap-3 ${selected?.id === item.id ? "bg-blue-50" : ""}`}>
                    <Thumb item={item} className="w-28 h-16" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 line-clamp-2">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-1 truncate">{item.category_name || item.department_name || "-"}</p>
                    </div>
                  </button>
                )) : (
                  <div className="px-4 py-6 text-sm text-slate-500 text-center">Tidak ada konten terkait (tag/judul/konten serupa).</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel: latest uploads */}
        <section className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Konten Terbaru</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => scrollCarousel(-1)} className="w-8 h-8 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 flex items-center justify-center" aria-label="Scroll kiri">‹</button>
              <button onClick={() => scrollCarousel(1)} className="w-8 h-8 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 flex items-center justify-center" aria-label="Scroll kanan">›</button>
            </div>
          </div>
          <div ref={carouselRef} className="flex gap-3 overflow-x-auto scroll-smooth pb-1" style={{ scrollbarWidth: "thin" }}>
            {latestFirst.map((item) => (
              <button key={item.id} onClick={() => setSelected(item)} className={`flex-none w-40 sm:w-44 md:w-48 text-left rounded-lg border p-2 hover:bg-slate-50 transition-colors ${selected?.id === item.id ? "border-blue-400 bg-blue-50" : "border-slate-200"}`}>
                <div className="w-full aspect-video bg-slate-200 rounded overflow-hidden flex items-center justify-center mb-2">
                  {thumbUrls[item.id] ? (
                    <img src={thumbUrls[item.id]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-500">{(item.mime_type || "").startsWith("video/") ? "Video" : "Doc"}</span>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-900 line-clamp-2">{item.title}</p>
                <p className="text-[11px] text-slate-500 mt-1 truncate">{item.category_name || item.department_name || ""}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Recently viewed */}
        <section className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Pernah Dilihat</h3>
          {recentlyViewed.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {recentlyViewed.map((item) => (
                <button key={item.id} onClick={() => setSelected(item)} className="text-left rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition-colors">
                  <div className="w-full aspect-video bg-slate-200 rounded overflow-hidden flex items-center justify-center mb-2">
                    {thumbUrls[item.id] ? <img src={thumbUrls[item.id]} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-slate-500">Doc</span>}
                  </div>
                  <p className="text-xs font-medium text-slate-900 line-clamp-2">{item.title}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Belum ada riwayat tontonan di Public Library.</p>
          )}
        </section>

        {/* All items - compact list without thumbnails */}
        <section className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Semua Dokumen & Media</h3>
            <span className="text-xs text-slate-500">{latestFirst.length} item</span>
          </div>
          {latestFirst.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-1 text-sm">
              {latestFirst.map((item) => (
                <li key={item.id} className="min-w-0">
                  <button
                    onClick={() => setSelected(item)}
                    className={`w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 truncate ${selected?.id === item.id ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}
                    title={item.title}
                  >
                    <span className="font-medium">{item.title}</span>
                    {item.category_name ? <span className="text-slate-400"> · {item.category_name}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Belum ada konten di Public Library.</p>
          )}
        </section>

        {error && (
          <div className="p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
}
