"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Role {
  id: string;
  code: string;
  name: string;
}

interface Department {
  id: string;
  code: string;
  name: string;
}

interface FormData {
  employee_number: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  job_title: string;
  role_ids: string[];
  department_ids: string[];
  password_mode: "auto" | "manual";
  password: string;
  must_change_password: boolean;
  is_active: boolean;
}

export default function UsersCreatePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<FormData>({
    employee_number: "",
    username: "",
    full_name: "",
    email: "",
    phone: "",
    job_title: "",
    role_ids: [],
    department_ids: [],
    password_mode: "auto",
    password: "",
    must_change_password: true,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [rolesRes, deptsRes] = await Promise.all([
          api.get("/roles"),
          api.get("/departments"),
        ]);
        setRoles(rolesRes.data || []);
        setDepartments(deptsRes.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load reference data");
      }
    }
    load();
  }, []);

  const handleChange = (
    field: keyof FormData,
    value: string | string[] | boolean
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/users", formData);
      setSuccess("User created successfully");
      setFormData({
        employee_number: "",
        username: "",
        full_name: "",
        email: "",
        phone: "",
        job_title: "",
        role_ids: [],
        department_ids: [],
        password_mode: "auto",
        password: "",
        must_change_password: true,
        is_active: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/users"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          ← Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create User</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.username}
                onChange={(e) =>
                  handleChange("username", e.target.value)
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.full_name}
                onChange={(e) =>
                  handleChange("full_name", e.target.value)
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Employee Number *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.employee_number}
                onChange={(e) =>
                  handleChange("employee_number", e.target.value)
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.job_title}
                onChange={(e) => handleChange("job_title", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Roles *
              </label>
              <select
                multiple
                size={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.role_ids}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions
                  ).map((o) => o.value);
                  handleChange("role_ids", selected);
                }}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.code} - {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Departments *
              </label>
              <select
                multiple
                size={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.department_ids}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions
                  ).map((o) => o.value);
                  handleChange("department_ids", selected);
                }}
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password Mode
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.password_mode}
                onChange={(e) =>
                  handleChange("password_mode", e.target.value)
                }
              >
                <option value="auto">Auto Generate</option>
                <option value="manual">Manual Entry</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.must_change_password}
              onChange={(e) =>
                handleChange("must_change_password", e.target.checked)
              }
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-slate-700 cursor-pointer">
              Must change password on next login
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-slate-700 cursor-pointer">
              User is active
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {submitting ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
}
