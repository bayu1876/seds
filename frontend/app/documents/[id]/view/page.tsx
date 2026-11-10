"use client";

import { useEffect, useMemo, useState } from "react";
import { use } from "react";
import Link from "next/link";

interface Version {
  id: string;
  version_number: number;
  original_filename: string;
  mime_type: string;
  is_current?: boolean;
}

interface Doc {
  id: string;
  title: string;
  document_number: string | null;
}

const API_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:3001/api";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("sed_token") : null;
}

export default function DocumentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: documentId } = use(params);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [version, setVersion] = useState<Version | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function load() {
      try {
        const token = getToken();
        const headers: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const [docRes, versionsRes] = await Promise.all([
          fetch(`${API_URL}/documents/${documentId}`, { headers }),
          fetch(`${API_URL}/document-versions/${documentId}`, { headers }),
        ]);

        const docJson = await docRes.json().catch(() => ({}));
        const verJson = await versionsRes.json().catch(() => ({}));
        if (!docRes.ok) throw new Error(docJson.message || "Failed to load document");
        if (!versionsRes.ok) throw new Error(verJson.message || "Failed to load document versions");

        const docData: Doc | null = docJson.data || null;
        const versions: Version[] = verJson.data || [];
        const current =
          versions.find((v) => v.is_current) ||
          [...versions].sort((a, b) => b.version_number - a.version_number)[0] ||
          null;

        if (cancelled) return;
        setDoc(docData);
        setVersion(current);

        if (!current) {
          setError("No version available to view");
          return;
        }

        const fileRes = await fetch(`${API_URL}/document-versions/${current.id}/download`, { headers });
        if (!fileRes.ok) {
          const j = await fileRes.json().catch(() => ({}));
          throw new Error(j.message || "Failed to load document file");
        }
        const blob = await fileRes.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setFileUrl(objectUrl);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to open document");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentId]);

  const mime = version?.mime_type || "";
  const isVideo = mime.startsWith("video/");
  const isImage = mime.startsWith("image/");
  const isPdf = mime === "application/pdf" || mime.includes("pdf");
  const isAudio = mime.startsWith("audio/");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-sm">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !version || !fileUrl) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200 p-6">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-xl p-6 text-center">
          <p className="text-red-400 mb-4">{error || "Document cannot be displayed"}</p>
          <Link href={`/documents/${documentId}`} className="text-blue-400 hover:text-blue-300 underline">
            Back to document details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 text-slate-100 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/documents/${documentId}`} className="text-sm text-slate-300 hover:text-white whitespace-nowrap">
            ← Details
          </Link>
          <span className="text-slate-600">|</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{doc?.title || "Document"}</p>
            <p className="text-xs text-slate-400 truncate">
              {doc?.document_number ? `${doc.document_number} · ` : ""}{version.original_filename}
            </p>
          </div>
        </div>
        <a
          href={fileUrl}
          download={version.original_filename}
          className="text-sm px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 whitespace-nowrap"
        >
          Download
        </a>
      </div>

      <div className="flex-1 min-h-0 bg-black">
        {isVideo ? (
          <video src={fileUrl} controls autoPlay className="w-full h-full" />
        ) : isAudio ? (
          <div className="w-full h-full flex items-center justify-center p-8">
            <audio src={fileUrl} controls className="w-full max-w-2xl" />
          </div>
        ) : isPdf ? (
          <iframe src={fileUrl} title={doc?.title || "Document"} className="w-full h-full border-0 bg-white" />
        ) : isImage ? (
          <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
            <img src={fileUrl} alt={doc?.title || "Document"} className="max-w-full max-h-full object-contain" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6">
            <div className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-xl p-6 text-center text-slate-200">
              <p className="mb-2 font-medium">Preview tidak tersedia untuk tipe file ini.</p>
              <p className="text-sm text-slate-400 mb-4">{version.original_filename} ({mime || "unknown"})</p>
              <a href={fileUrl} download={version.original_filename} className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
                Download file
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
