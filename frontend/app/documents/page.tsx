"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface DocumentItem {
  id: string;
  title: string;
  documentNumber: string | null;
  description: string | null;
  department: string;
  category: string;
  confidentialLevel: string;
  effectiveDate: string | null;
  expiredDate: string | null;
  isActive: boolean;
}

interface BackendDocument {
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
}

export default function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParams);
  const queryParam = resolvedSearchParams?.q;
  const q =
    typeof queryParam === "string"
      ? queryParam
      : Array.isArray(queryParam)
        ? queryParam[0]
        : undefined;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDocuments = async () => {
    try {
      const endpoint = q
        ? `/search/documents?q=${encodeURIComponent(q)}`
        : "/documents";
      const result = await api.get(endpoint);
      const raw = result.data || [];
      setDocuments(
        raw.map((doc: BackendDocument) => ({
          id: doc.id,
          title: doc.title,
          documentNumber: doc.document_number,
          description: doc.description,
          department: doc.department?.name || "-",
          category: doc.category?.name || "-",
          confidentialLevel: doc.confidentialLevel?.name || "-",
          effectiveDate: doc.effective_date,
          expiredDate: doc.expired_date,
          isActive: doc.is_active,
        }))
      );
    } catch (err: any) {
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [q]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete document "${title}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete document");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading documents...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <Link
          href="/documents/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          Upload Document
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Document Number</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Department</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Confidential Level</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length > 0 ? (
              documents.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium">{doc.documentNumber || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{doc.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{doc.department}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{doc.category}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{doc.confidentialLevel}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {doc.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Link href={`/documents/${doc.id}`} className="text-blue-600 hover:text-blue-700 text-sm">View</Link>
                      <Link href={`/documents/${doc.id}/edit`} className="text-slate-600 hover:text-slate-800 text-sm">Edit</Link>
                      <button
                        onClick={() => handleDelete(doc.id, doc.title)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No documents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
