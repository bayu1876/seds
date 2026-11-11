"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, auth } from "@/lib/api";
import { Can, CanAll } from "@/lib/permissions";

interface User {
  id: string;
  username: string;
  full_name: string;
  employee_number: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const currentUserId = auth.getUser()?.id as string | undefined;

  useEffect(() => {
    async function load() {
      try {
        const result = await api.get("/users");
        setItems(result.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async (item: User) => {
    if (currentUserId === item.id) return;
    if (
      !window.confirm(
        `Hapus user "${item.username}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }

    setDeletingId(item.id);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/users/${item.id}`);
      setItems((prev) => prev.filter((user) => user.id !== item.id));
      setSuccess(`User "${item.username}" berhasil dihapus.`);
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <Can module="user" action="create">
          <Link
            href="/admin/users/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Add User
          </Link>
        </Can>
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

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Username</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Full Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Employee No.</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {item.username}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">{item.full_name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {item.employee_number || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {item.email || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <CanAll
                        requirements={[
                          { module: "user", action: "view" },
                          { module: "user", action: "update" },
                          { module: "role", action: "view" },
                          { module: "department", action: "view" },
                        ]}
                      >
                        <Link
                          href={`/admin/users/${item.id}/edit`}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Edit
                        </Link>
                      </CanAll>
                      <Can module="user" action="delete">
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={
                            deletingId === item.id ||
                            currentUserId === item.id
                          }
                          title={
                            currentUserId === item.id
                              ? "Tidak dapat menghapus akun sendiri"
                              : "Hapus user"
                          }
                          className="text-red-600 hover:text-red-700 text-sm disabled:text-slate-300 disabled:cursor-not-allowed"
                        >
                          {deletingId === item.id ? "Deleting..." : "Delete"}
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
