"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface PublicationItem {
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

interface SelectableDocument {
  id: string;
  document_number: string | null;
  title: string;
}

interface Version {
  id: string;
  version_number: number;
  original_filename: string;
  is_current: boolean;
}

export default function PublicLibraryAdminPage() {
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [documents, setDocuments] = useState<SelectableDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [publicationsResult, documentsResult] = await Promise.all([
          api.get("/public-library/admin"),
          api.get("/documents"),
        ]);

        setPublications(publicationsResult.data || []);
        setDocuments(
          (documentsResult.data || []).map(
            (doc: SelectableDocument) => ({
              id: doc.id,
              document_number: doc.document_number,
              title: doc.title,
            }),
          ),
        );
      } catch (err: any) {
        setError(err.message || "Failed to load publications");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDocumentChange = async (documentId: string) => {
    setSelectedDocumentId(documentId);
    setSelectedVersionId("");
    setSelectedVersion(null);

    if (!documentId) {
      setVersions([]);
      return;
    }

    try {
      const versionsResult = await api.get(`/document-versions/${documentId}`);
      const versionsList: Version[] = versionsResult.data || [];
      setVersions(versionsList);
      const current =
        versionsList.find((v) => v.is_current) || versionsList[0] || null;

      if (current) {
        setSelectedVersionId(current.id);
        setSelectedVersion(current);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load document versions");
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedDocumentId || !selectedVersionId) {
      setError("Please select a document and a version to publish");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/public-library/admin", {
        document_id: selectedDocumentId,
        version_id: selectedVersionId,
        featured,
        display_order: Number(displayOrder) || 0,
      });
      setSuccess(res?.message || "Document published successfully");
      setSelectedDocumentId("");
      setSelectedVersionId("");
      setSelectedVersion(null);
      setFeatured(false);
      setDisplayOrder("0");

      const publicationsResult = await api.get("/public-library/admin");
      setPublications(publicationsResult.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to publish document");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFeatured = async (publication: PublicationItem) => {
    try {
      const res = await api.patch(`/public-library/admin/${publication.id}/featured`, {
        featured: !publication.featured,
      });
      setSuccess(res?.message || "Publication updated successfully");
      const publicationsResult = await api.get("/public-library/admin");
      setPublications(publicationsResult.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to update publication");
    }
  };

  const handleUnpublish = async (publication: PublicationItem) => {
    try {
      const res = await api.delete(`/public-library/admin/${publication.id}`);
      setSuccess(res?.message || "Document unpublished successfully");
      const publicationsResult = await api.get("/public-library/admin");
      setPublications(publicationsResult.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to unpublish document");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading publications...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Public Library</h1>
          <p className="text-sm text-slate-500 mt-1">Publication Management</p>
        </div>
        <Link
          href="/public-library"
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 text-sm font-medium transition-colors"
        >
          Back to Public Library
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 rounded bg-green-50 text-green-700 border border-green-100 text-sm">
          {success}
        </div>
      )}

      {/* Publish Form */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Publish Document</h2>
        <form onSubmit={handlePublish} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Document *
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={selectedDocumentId}
                onChange={(e) => handleDocumentChange(e.target.value)}
                required
              >
                <option value="">Select document</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.document_number ? `#${d.document_number} - ` : ""}
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Version *
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={selectedVersionId}
                onChange={(e) => setSelectedVersionId(e.target.value)}
                disabled={!selectedDocumentId}
                required
              >
                <option value="">Select version</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    Version {v.version_number} - {v.original_filename}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={0}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                Featured
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {submitting ? "Publishing..." : "Publish"}
          </button>
        </form>
      </div>

      {/* Publications List */}
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Publications</h2>
        {publications.length === 0 ? (
          <p className="text-sm text-slate-500">No publications yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-700">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Document</th>
                  <th className="py-2 pr-4">Department</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Featured</th>
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {publications.map((pub) => (
                  <tr key={pub.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-900">{pub.title}</td>
                    <td className="py-2 pr-4">{pub.document_number || "-"}</td>
                    <td className="py-2 pr-4">{pub.department_name || "-"}</td>
                    <td className="py-2 pr-4">{pub.category_name || "-"}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pub.is_published
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {pub.is_published ? "Published" : "Unpublished"}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{pub.featured ? "⭐" : "—"}</td>
                    <td className="py-2 pr-4">{pub.display_order}</td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleFeatured(pub)}
                          className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 text-xs font-medium transition-colors"
                        >
                          {pub.featured ? "Unfeature" : "Feature"}
                        </button>
                        <button
                          onClick={() => handleUnpublish(pub)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-xs font-medium transition-colors"
                        >
                          Unpublish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
