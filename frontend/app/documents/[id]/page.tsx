"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, downloadFile } from "@/lib/api";

interface Tag {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  is_active: boolean;
}

interface DocumentTagItem {
  id: string;
  tag_id: string;
  tag: Tag;
}

interface Document {
  id: string;
  document_number: string | null;
  title: string;
  description: string | null;
  department: { name: string } | null;
  category: { name: string } | null;
  confidentialLevel: { name: string } | null;
  effective_date: string | null;
  expired_date: string | null;
  is_active: boolean;
  documentTags?: DocumentTagItem[];
  current_version?: {
    id: string;
    original_filename: string;
    file_size: number;
    version_number: number;
    uploaded_by: string;
    uploaded_at: string;
  } | null;
}

interface Version {
  id: string;
  document_id: string;
  version_number: number;
  original_filename: string;
  stored_filename: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  thumbnail_path: string | null;
  preview_status: string;
  version_notes: string | null;
  uploaded_at: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_current: boolean;
}

interface Publication {
  id: string;
  document_id: string;
  document_number: string | null;
  title: string;
  description: string | null;
  department_name: string | null;
  category_name: string | null;
  is_published: boolean;
  featured: boolean;
  display_order: number;
  published_at: string | null;
}

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: documentId } = use(params);
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [publication, setPublication] = useState<Publication | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await api.get(`/documents/${documentId}`);
        const docData: Document = result.data || null;
        setDoc(docData);

        const versionsResult = await api.get(`/document-versions/${documentId}`);
        const versionList: Version[] = versionsResult.data || [];
        setVersions(versionList);

        const publicationsResult = await api.get("/public-library/admin");
        const pubList: Publication[] = publicationsResult.data || [];
        const pub = pubList.find((p) => p.document_id === documentId) || null;
        setPublication(pub);

        try {
          const tagsRes = await api.get("/tags");
          setAllTags(tagsRes.data || []);
        } catch {
          // tags optional if no permission
        }

        await api.post("/recent-view", { document_id: documentId });
      } catch (err: any) {
        setError(err.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [documentId]);

  const handleToggleFavorite = async () => {
    if (!doc) return;
    try {
      const result = await api.post("/favorite", { document_id: doc.id });
      setIsFavorite(!!result.data?.isFavorite);
    } catch (err: any) {
      setError(err.message || "Failed to update favorite");
    }
  };

  const refreshDocument = async () => {
    try {
      const result = await api.get(`/documents/${documentId}`);
      setDoc(result.data || null);
    } catch {}
  };

  const handleAddTag = async () => {
    if (!doc || !tagInput.trim()) return;
    setError("");
    setSuccess("");
    try {
      await api.post("/document-tags", { document_id: doc.id, tag_name: tagInput.trim() });
      setTagInput("");
      await refreshDocument();
      setSuccess("Tag added to document");
    } catch (err: any) {
      setError(err.message || "Failed to add tag");
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!doc) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/document-tags/${doc.id}/${tagId}`);
      await refreshDocument();
      setSuccess("Tag removed from document");
    } catch (err: any) {
      setError(err.message || "Failed to remove tag");
    }
  };

  const handleDownload = async () => {
    try {
      const current = versions.find((v) => v.is_current) || versions[0];
      if (!current) {
        setError("No version available");
        return;
      }
      await downloadFile(
        `/document-versions/${current.id}/download`,
        current.original_filename,
      );
    } catch (err: any) {
      setError(err.message || "Failed to download document");
    }
  };

  const handleDelete = async () => {
    if (!doc) return;
    if (!window.confirm(`Delete document "${doc.title}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/documents/${doc.id}`);
      router.push("/documents");
    } catch (err: any) {
      setError(err.message || "Failed to delete document");
    }
  };

  const handleTogglePublish = async () => {
    if (!doc) return;
    setError("");
    setSuccess("");

    try {
      if (publication?.is_published) {
        const res = await api.delete(`/public-library/admin/${publication.id}`);
        setPublication(null);
        setSuccess(res?.message || "Document unpublished from Public Library");
      } else {
        const current = versions.find((v) => v.is_current) || versions[0];
        if (!current) {
          setError("No version available to publish");
          return;
        }
        const res = await api.post("/public-library/admin", {
          document_id: doc.id,
          version_id: current.id,
          featured: publication?.featured || false,
          display_order: publication?.display_order || 0,
        });
        const newPublication: Publication | null = res?.data || null;
        if (newPublication) setPublication(newPublication);
        setSuccess(res?.message || "Document published to Public Library");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update publication status");
    }
  };

  const handleToggleFeatured = async (checked: boolean) => {
    if (!doc) return;
    setError("");
    setSuccess("");

    try {
      if (checked) {
        if (publication?.is_published) {
          const res = await api.patch(
            `/public-library/admin/${publication.id}/featured`,
            { featured: true },
          );
          setPublication({ ...publication, featured: true });
          setSuccess(res?.message || "Document added to Featured Knowledge");
        } else {
          const current = versions.find((v) => v.is_current) || versions[0];
          if (!current) {
            setError("No version available");
            return;
          }
          const res = await api.post("/public-library/admin", {
            document_id: doc.id,
            version_id: current.id,
            featured: true,
            display_order: 0,
          });
          const newPublication: Publication | null = res?.data || null;
          if (newPublication) setPublication(newPublication);
          setSuccess(res?.message || "Document published and added to Featured Knowledge");
        }
      } else {
        if (!publication) return;
        const res = await api.patch(
          `/public-library/admin/${publication.id}/featured`,
          { featured: false },
        );
        setPublication({ ...publication, featured: false });
        setSuccess(res?.message || "Document removed from Featured Knowledge");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update featured status");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">
          {error}
        </div>
        <Link
          href="/documents"
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Documents
        </Link>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="p-4 rounded bg-slate-100 text-slate-500 text-sm">
          Document not found
        </div>
        <Link
          href="/documents"
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Documents
        </Link>
      </div>
    );
  }

  const currentVersion =
    versions.find((v) => v.is_current) || versions[0] || doc.current_version || null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/documents"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Documents
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
              isFavorite
                ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                : "bg-slate-200 text-slate-700 border-transparent hover:bg-slate-300"
            }`}
          >
            {isFavorite ? "♥ Favorited" : "♡ Favorite"}
          </button>
          <Link
            href={`/documents/${doc.id}/edit`}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 text-sm font-medium transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Download
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-4 rounded bg-green-50 text-green-700 border border-green-100 text-sm">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {doc.title || "Untitled Document"}
          </h1>
          {doc.document_number && (
            <p className="text-sm text-slate-500 mt-1">#{doc.document_number}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Department
            </h3>
            <p className="text-sm text-slate-900">
              {doc.department?.name || "-"}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Category
            </h3>
            <p className="text-sm text-slate-900">{doc.category?.name || "-"}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Confidential Level
            </h3>
            <p className="text-sm text-slate-900">
              {doc.confidentialLevel?.name || "-"}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Effective Date
            </h3>
            <p className="text-sm text-slate-900">
              {doc.effective_date ? new Date(doc.effective_date).toLocaleDateString("id-ID") : "-"}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Expired Date
            </h3>
            <p className="text-sm text-slate-900">
              {doc.expired_date ? new Date(doc.expired_date).toLocaleDateString("id-ID") : "-"}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Status
            </h3>
            <p className={`text-sm font-medium ${
              doc.is_active ? "text-green-700" : "text-slate-600"
            }`}>
              {doc.is_active ? "Active" : "Inactive"}
            </p>
          </div>
        </div>

        {doc.description && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Description
            </h3>
            <p className="text-sm text-slate-900">{doc.description}</p>
          </div>
        )}

        {currentVersion && (
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">
              Current Version
            </h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-900 font-medium">
                    {currentVersion.original_filename}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Version {currentVersion.version_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-900 font-medium">
                    {(currentVersion.file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(currentVersion.uploaded_at).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">
            Tags
          </h3>
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {(doc.documentTags || []).length > 0 ? (
                (doc.documentTags || []).map((dt) => (
                  <span
                    key={dt.id}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-white border border-slate-200 text-slate-700"
                  >
                    {dt.tag?.color && (
                      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dt.tag.color }} />
                    )}
                    {dt.tag?.name || "Tag"}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(dt.tag_id || dt.tag?.id)}
                      className="text-slate-400 hover:text-red-600"
                      title="Remove tag"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No tags assigned.</p>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ketik tag lalu Enter atau klik Tambah (free text)"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                list="tag-suggestions"
              />
              <datalist id="tag-suggestions">
                {allTags
                  .filter((t) => !(doc.documentTags || []).some((dt) => (dt.tag_id || dt.tag?.id) === t.id))
                  .map((t) => (
                    <option key={t.id} value={t.name} />
                  ))}
              </datalist>
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
              >
                Tambah Tag
              </button>
            </div>
            <p className="text-xs text-slate-500">Tag bersifat penanda bebas untuk memudahkan pencarian (bukan status/approval).</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">
            Public Library
          </h3>
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Published</p>
                <p className="text-xs text-slate-500">Make this document available in the Public Library.</p>
              </div>
              <button
                type="button"
                onClick={handleTogglePublish}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  publication?.is_published
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {publication?.is_published ? "Unpublish" : "Publish"}
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700 pt-1">
              <input
                type="checkbox"
                checked={!!publication?.featured}
                onChange={(e) => handleToggleFeatured(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              Included in Featured Knowledge
            </label>

            <p className="text-xs text-slate-500">
              Status: {publication?.is_published ? "Published in Public Library" : "Not published"}. Featured items (published) appear on the Dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
