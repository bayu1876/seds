"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface Category {
  id: string;
  code: string;
  name: string;
}

interface ConfidentialLevel {
  id: string;
  code: string;
  name: string;
}

interface BackendDocument {
  id: string;
  document_number: string | null;
  title: string;
  description: string | null;
  department_id: string;
  category_id: string;
  confidential_level_id: string;
  effective_date: string | null;
  expired_date: string | null;
  is_active: boolean;
}

export default function DocumentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: documentId } = use(params);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    document_number: "",
    description: "",
    department_id: "",
    category_id: "",
    confidential_level_id: "",
    effective_date: "",
    expired_date: "",
    is_active: true,
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [confidentialLevels, setConfidentialLevels] = useState<ConfidentialLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [docRes, deptRes, catRes, lvlRes] = await Promise.all([
          api.get(`/documents/${documentId}`),
          api.get("/departments"),
          api.get("/categories"),
          api.get("/confidential-levels"),
        ]);

        const doc: BackendDocument = docRes.data;
        setFormData({
          title: doc.title || "",
          document_number: doc.document_number || "",
          description: doc.description || "",
          department_id: doc.department_id || "",
          category_id: doc.category_id || "",
          confidential_level_id: doc.confidential_level_id || "",
          effective_date: doc.effective_date ? doc.effective_date.slice(0, 10) : "",
          expired_date: doc.expired_date ? doc.expired_date.slice(0, 10) : "",
          is_active: !!doc.is_active,
        });

        setDepartments(deptRes.data || []);
        setCategories(catRes.data || []);
        setConfidentialLevels(lvlRes.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [documentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    if (!formData.title.trim()) {
      setError("Title is required");
      setSubmitting(false);
      return;
    }
    if (!formData.department_id || !formData.category_id || !formData.confidential_level_id) {
      setError("Department, category, and confidential level are required");
      setSubmitting(false);
      return;
    }

    try {
      await api.put(`/documents/${documentId}`, {
        title: formData.title.trim(),
        document_number: formData.document_number.trim() || null,
        description: formData.description.trim() || null,
        department_id: formData.department_id,
        category_id: formData.category_id,
        confidential_level_id: formData.confidential_level_id,
        effective_date: formData.effective_date || null,
        expired_date: formData.expired_date || null,
        is_active: formData.is_active,
      });

      setSuccess("Document updated successfully");
      router.push(`/documents/${documentId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update document");
    } finally {
      setSubmitting(false);
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/documents/${documentId}`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Document
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Document</h1>
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

      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Document Number</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.document_number}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                required
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confidential Level *</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.confidential_level_id}
                onChange={(e) => setFormData({ ...formData, confidential_level_id: e.target.value })}
                required
              >
                <option value="">Select level</option>
                {confidentialLevels.map((l) => (
                  <option key={l.id} value={l.id}>{l.code} - {l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Effective Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expired Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.expired_date}
                onChange={(e) => setFormData({ ...formData, expired_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-slate-700">Active</label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
