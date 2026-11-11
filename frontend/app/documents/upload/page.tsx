"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useDepartmentAccess } from "@/lib/permissions";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface Category {
  id: string;
  code: string;
  name: string;
  display_order: number;
}

interface ConfidentialLevel {
  id: string;
  code: string;
  name: string;
  display_order: number;
}

interface Tag {
  id: string;
  name: string;
  color: string | null;
  is_active: boolean;
}

export default function DocumentsUploadPage() {
  const router = useRouter();
  const { isSuperAdmin, allowedDepartmentIds } = useDepartmentAccess();

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
  const [versionNotes, setVersionNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [confidentialLevels, setConfidentialLevels] = useState<ConfidentialLevel[]>(
    [],
  );
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [departmentsResult, categoriesResult, levelsResult, tagsResult] =
          await Promise.all([
            api.get("/departments"),
            api.get("/categories"),
            api.get("/confidential-levels"),
            api.get("/tags").catch(() => ({ data: [] })),
          ]);

        const allDepartments: Department[] = departmentsResult.data || [];
        const scopedDepartments = isSuperAdmin
          ? allDepartments
          : allDepartments.filter((department) =>
              allowedDepartmentIds.includes(department.id),
            );

        setDepartments(scopedDepartments);
        if (scopedDepartments.length === 1 && scopedDepartments[0]) {
          const onlyDepartment = scopedDepartments[0];
          setFormData((prev) =>
            prev.department_id
              ? prev
              : { ...prev, department_id: onlyDepartment.id },
          );
        }
        setCategories(categoriesResult.data || []);
        setConfidentialLevels(levelsResult.data || []);
        setAvailableTags((tagsResult.data || []).filter((t: Tag) => t.is_active));
      } catch (err: any) {
        setError(err.message || "Failed to load options");
      }
    }
    loadOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }
    if (!formData.department_id) {
      setError("Please select a department");
      setLoading(false);
      return;
    }
    if (!formData.category_id) {
      setError("Please select a category");
      setLoading(false);
      return;
    }
    if (!formData.confidential_level_id) {
      setError("Please select a confidential level");
      setLoading(false);
      return;
    }
    if (!file) {
      setError("Please select a file to upload");
      setLoading(false);
      return;
    }

    try {
      setSubmitting(true);

      const createRes = await api.post("/documents", {
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

      const documentId = createRes?.data?.id;

      if (!documentId) {
        throw new Error("Failed to create document");
      }

      const formDataToUpload = new FormData();
      formDataToUpload.append("file", file);
      formDataToUpload.append("version_notes", versionNotes);

      const uploadRes = await api.upload(
        `/document-versions/${documentId}/upload`,
        formDataToUpload,
      );

      if (selectedTagNames.length > 0) {
        await Promise.allSettled(
          selectedTagNames.map((tagName) =>
            api.post("/document-tags", { document_id: documentId, tag_name: tagName })
          )
        );
      }

      setSuccess("Document uploaded successfully");
      router.push(`/documents/${documentId}`);
    } catch (err: any) {
      setError(err.message || "Failed to upload document");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Upload Document</h1>
        <Link
          href="/documents"
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 text-sm font-medium transition-colors"
        >
          Back to Documents
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Document Number
              </label>
              <input
                type="text"
                placeholder="Auto-generated if empty (e.g. IT-SOP-20261110-0001)"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.document_number}
                onChange={(e) =>
                  setFormData({ ...formData, document_number: e.target.value })
                }
              />
              <p className="mt-1 text-xs text-slate-500">
                Leave empty to auto-generate sequentially using Department and Category codes.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Department *
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.department_id}
                onChange={(e) =>
                  setFormData({ ...formData, department_id: e.target.value })
                }
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category *
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confidential Level *
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.confidential_level_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confidential_level_id: e.target.value,
                  })
                }
              >
                <option value="">Select level</option>
                {confidentialLevels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} - {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.effective_date}
                onChange={(e) =>
                  setFormData({ ...formData, effective_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Expired Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.expired_date}
                onChange={(e) =>
                  setFormData({ ...formData, expired_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-slate-700">Active</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTagNames.map((name) => (
                <span key={name} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700 border border-slate-200">
                  {name}
                  <button
                    type="button"
                    onClick={() => setSelectedTagNames((prev) => prev.filter((n) => n.toLowerCase() !== name.toLowerCase()))}
                    className="text-slate-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const v = tagInput.trim().replace(/\s+/g, " ");
                    if (v && !selectedTagNames.some((n) => n.toLowerCase() === v.toLowerCase())) {
                      setSelectedTagNames((prev) => [...prev, v]);
                    }
                    setTagInput("");
                  }
                }}
                placeholder="Ketik tag (free text) lalu Enter/koma"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                list="upload-tag-suggestions"
              />
              <datalist id="upload-tag-suggestions">
                {availableTags.map((t) => (
                  <option key={t.id} value={t.name} />
                ))}
              </datalist>
              <button
                type="button"
                onClick={() => {
                  const v = tagInput.trim().replace(/\s+/g, " ");
                  if (v && !selectedTagNames.some((n) => n.toLowerCase() === v.toLowerCase())) {
                    setSelectedTagNames((prev) => [...prev, v]);
                  }
                  setTagInput("");
                }}
                className="px-3 py-2 bg-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-300"
              >
                Tambah
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Tag bersifat penanda bebas untuk memudahkan pencarian (bukan status/approval). Bisa ketik tag baru.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              File *
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-slate-100 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Version Notes
            </label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
              placeholder="Optional change note for this version"
            />
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading || submitting ? "Uploading..." : "Upload Document"}
          </button>
        </form>
      </div>
    </div>
  );
}
