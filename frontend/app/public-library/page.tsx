"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

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
  preview_status?: string | null;
}

const API_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:3001/api";

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

export default function PublicLibraryPage() {
  const searchParams = useSearchParams();
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
            const featured = items.find((i) => i.featured);
            if (featured) {
              setSelected(featured);
            } else {
              const videos = items
                .filter((i) => (i.mime_type || "").startsWith("video/"))
                .sort((a, b) => {
                  const da = a.published_at ? new Date(a.published_at).getTime() : 0;
                  const db = b.published_at ? new Date(b.published_at).getTime() : 0;
                  return db - da;
                });
              setSelected(videos[0] || items[0]);
            }
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load public library");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // load thumbnails for sidebar items
  useEffect(() => {
    let cancelled = false;
    const created: string[] = [];
    async function loadThumbs() {
      for (const item of publications) {
        if (!item.version_id || !item.thumbnail_path) continue;
        if (thumbUrls[item.id]) continue;
        const url = await fetchBlobUrl(`/document-versions/${item.version_id}/thumbnail`);
        if (cancelled) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        if (url) {
          created.push(url);
          setThumbUrls((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: url }));
        }
      }
    }
    loadThumbs();
    return () => {
      cancelled = true;
      // don't revoke all on dep change to avoid flicker; revoke on unmount handled separately
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publications]);

  useEffect(() => {
    return () => {
      Object.values(thumbUrls).forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return;

    let active = true;
    let localUrl: string | null = null;
    let localThumb: string | null = null;

    async function loadMedia() {
      setMediaLoading(true);
      setVersion(null);
      if (mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
        setMediaUrl(null);
      }
      if (selectedThumbUrl) {
        URL.revokeObjectURL(selectedThumbUrl);
        setSelectedThumbUrl(null);
      }
      try {
        const versionsResult = await api.get(`/document-versions/${selected!.document_id}`);
        const versions: Version[] = versionsResult.data || [];
        const current = versions.find((v) => v.is_current) || versions[0] || null;
        setVersion(current);

        if (current) {
          if (current.thumbnail_path) {
            const turl = await fetchBlobUrl(`/document-versions/${current.id}/thumbnail`);
            if (!active) {
              if (turl) URL.revokeObjectURL(turl);
            } else if (turl) {
              localThumb = turl;
              setSelectedThumbUrl(turl);
            }
          }
          const url = await fetchBlobUrl(`/document-versions/${current.id}/download`);
          if (!active) {
            if (url) URL.revokeObjectURL(url);
            return;
          }
          localUrl = url;
          setMediaUrl(url);
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
  }, [selected]);

  const isVideo = version?.mime_type?.startsWith("video/");
  const isAudio = version?.mime_type?.startsWith("audio/");
  const related = publications.filter((p) => selected && p.id !== selected.id);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading public library...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-slate-900 text-white py-6 px-6 mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">SEDS — Public Library</h1>
          <p className="text-slate-400 text-sm">Curated Knowledge Portal</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pb-10">
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
                  <p>No preview available</p>
                </div>
              )}
            </div>

            {selected && (
              <div className="mt-4 bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">{selected.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-3">
                  {selected.department_name && <span>{selected.department_name}</span>}
                  {selected.category_name && <span>• {selected.category_name}</span>}
                  {selected.document_number && <span>• #{selected.document_number}</span>}
                </div>
                {selected.description && (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.description}</p>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Related</h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
                {related.length > 0 ? (
                  related.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className={`w-full text-left px-3 py-3 hover:bg-slate-50 transition-colors flex gap-3 ${
                        selected?.id === item.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="w-28 h-16 bg-slate-200 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {thumbUrls[item.id] ? (
                          <img src={thumbUrls[item.id]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-500 px-1 text-center">
                            {item.mime_type?.startsWith("video/") ? "Video" : "Doc"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 line-clamp-2">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {item.department_name || item.category_name || "-"}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-sm text-slate-500 text-center">No related items</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
