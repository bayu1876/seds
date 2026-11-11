"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import { Can } from "@/lib/permissions";

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

interface UserDetail {
  id: string;
  employee_number: string | null;
  username: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  is_active: boolean;
  roles: Role[];
  departments: Department[];
}

interface FormData {
  employee_number: string;
  full_name: string;
  email: string;
  phone: string;
  job_title: string;
  role_ids: string[];
  department_ids: string[];
  is_active: boolean;
}

export default function UsersEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const currentUser = auth.getUser();
  const isSelf = currentUser?.id === id;

  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [username, setUsername] = useState("");
  const [formData, setFormData] = useState<FormData>({
    employee_number: "",
    full_name: "",
    email: "",
    phone: "",
    job_title: "",
    role_ids: [],
    department_ids: [],
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [passwordMode, setPasswordMode] = useState<"auto" | "manual">("auto");
  const [newPassword, setNewPassword] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function load() {
      try {
        const [userRes, rolesRes, deptsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get("/roles"),
          api.get("/departments"),
        ]);

        const user: UserDetail = userRes.data;
        setUsername(user.username);
        setFormData({
          employee_number: user.employee_number || "",
          full_name: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
          job_title: user.job_title || "",
          role_ids: (user.roles || []).map((role) => role.id),
          department_ids: (user.departments || []).map((dept) => dept.id),
          is_active: !!user.is_active,
        });
        setRoles(rolesRes.data || []);
        setDepartments(deptsRes.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleChange = (
    field: keyof FormData,
    value: string | string[] | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    setTemporaryPassword(null);

    try {
      await api.put(`/users/${id}`, {
        employee_number: formData.employee_number.trim() || null,
        full_name: formData.full_name,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        job_title: formData.job_title.trim() || null,
        role_ids: formData.role_ids,
        department_ids: formData.department_ids,
        is_active: isSelf ? true : formData.is_active,
      });
      setSuccess("User updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setResetting(true);
    setError("");
    setSuccess("");
    setTemporaryPassword(null);

    try {
      const res = await api.patch(`/users/${id}/reset-password`, {
        password_mode: passwordMode,
        password: passwordMode === "manual" ? newPassword : undefined,
        must_change_password: mustChangePassword,
      });
      const temp = res?.data?.temporaryPassword || null;
      setTemporaryPassword(temp);
      setNewPassword("");
      setSuccess(
        temp
          ? "Password reset. Salin password sementara di bawah."
          : "Password reset successfully",
      );
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async () => {
    if (isSelf) return;
    if (
      !window.confirm(
        `Hapus user "${username}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(`/users/${id}`);
      router.push("/admin/users");
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading user...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/admin/users"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          ← Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit User</h1>
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

      {temporaryPassword && (
        <div className="mb-6 p-4 rounded bg-amber-50 text-amber-800 border border-amber-200 text-sm">
          Temporary password:{" "}
          <span className="font-mono font-semibold">{temporaryPassword}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-500"
                value={username}
                disabled
              />
              <p className="text-xs text-slate-400 mt-1">
                Username tidak dapat diubah.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Employee Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.employee_number}
                onChange={(e) =>
                  handleChange("employee_number", e.target.value)
                }
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
                  const selected = Array.from(e.target.selectedOptions).map(
                    (o) => o.value,
                  );
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
                  const selected = Array.from(e.target.selectedOptions).map(
                    (o) => o.value,
                  );
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

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isSelf ? true : formData.is_active}
              disabled={isSelf}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-slate-700 cursor-pointer">
              User is active
              {isSelf && (
                <span className="text-xs text-slate-500">
                  {" "}
                  (tidak dapat menonaktifkan akun sendiri)
                </span>
              )}
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
            <Can module="user" action="delete">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSelf}
                title={isSelf ? "Tidak dapat menghapus akun sendiri" : "Hapus user"}
                className="py-3 px-4 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Delete User
              </button>
            </Can>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-8 mt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Reset Password
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Buat password baru untuk user ini. Password lama tidak diperlukan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password Mode
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={passwordMode}
              onChange={(e) =>
                setPasswordMode(e.target.value as "auto" | "manual")
              }
            >
              <option value="auto">Auto Generate</option>
              <option value="manual">Manual Entry</option>
            </select>
          </div>
          {passwordMode === "manual" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 mt-4">
          <input
            type="checkbox"
            checked={mustChangePassword}
            onChange={(e) => setMustChangePassword(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <label className="text-sm text-slate-700 cursor-pointer">
            Must change password on next login
          </label>
        </div>

        <button
          type="button"
          onClick={handleResetPassword}
          disabled={
            resetting || (passwordMode === "manual" && !newPassword.trim())
          }
          className="mt-4 py-2.5 px-5 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {resetting ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}
