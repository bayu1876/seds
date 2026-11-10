"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function TagsCreatePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    color: "",
    description: "",
    is_system: false,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Tag name is required");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/tags", {
        name: formData.name.trim(),
        color: formData.color.trim() || null,
        description: formData.description.trim() || null,
        is_system: formData.is_system,
        is_active: formData.is_active,
      });

      setSuccess(res?.message || "Tag created successfully");
      router.push("/admin/tags");
    } catch (err: any) {
      setError(err.message || "Failed to create tag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/tags"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          ← Back to Tags
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create Tag</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded bg-red-50 text-red-700 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded bg-green-50 text-green-700 border border-green-100 text-sm">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Safety"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Color
            </label>
            <input
              type="text"
              placeholder="e.g. #3B82F6"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.is_system}
              onChange={(e) => setFormData({ ...formData, is_system: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-slate-700 cursor-pointer">
              System tag
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-slate-700 cursor-pointer">
              Active
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? "Creating..." : "Create Tag"}
          </button>
        </form>
      </div>
    </div>
  );
}
