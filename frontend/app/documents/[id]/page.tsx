"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Document {
  id: string;
  document_number: string | null;
  title: string;
  description: string | null;
  department: { name: string } | null;
  category: { name: string } | null;
  confidential_level: { name: string } | null;
  effective_date: string | null;
  expired_date: string | null;
  is_active: boolean;
  current_version: {
    id: string;
    original_filename: string;
    file_size: number;
    version_number: number;
    uploaded_by: string;
    uploaded_at: string;
  } | null;
}

export default function DocumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await api.get(`/documents/${params.id}`);
        setDoc(result.data || null);
      } catch (err: any) {
        setError(err.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

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
          <Link
            href={`/documents/${doc.id}/edit`}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 text-sm font-medium transition-colors"
          >
            Edit
          </Link>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Download
          </button>
        </div>
      </div>

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
              {doc.confidential_level?.name || "-"}
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

        {doc.current_version && (
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">
              Current Version
            </h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-900 font-medium">
                    {doc.current_version.original_filename}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Version {doc.current_version.version_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-900 font-medium">
                    {(doc.current_version.file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(doc.current_version.uploaded_at).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
