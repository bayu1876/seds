"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { BASE_PERMISSION_SET, usePermissions } from "@/lib/permissions";

interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

interface MatrixPermission {
  id: string;
  module: string;
  action: string;
  description: string | null;
  assigned: boolean;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

const MODULE_LABELS: Record<string, string> = {
  announcement: "Announcements",
  audit: "Audit Log",
  category: "Categories",
  confidential_level: "Confidential Levels",
  dashboard: "Dashboard",
  department: "Departments",
  document: "Documents",
  document_relation: "Document Relations",
  document_tag: "Document Tags",
  document_version: "Document Versions",
  permission: "Permissions",
  role: "Roles",
  role_permission: "Role Permissions",
  tag: "Tags",
  user: "Users",
};

export default function PermissionsPage() {
  const { has } = usePermissions();
  const canUpdate = has("role_permission", "update");

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [permissions, setPermissions] = useState<MatrixPermission[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const isSuperAdminRole = selectedRole?.code === "SUPER_ADMIN";

  useEffect(() => {
    async function loadRoles() {
      try {
        const result = await api.get("/roles");
        const list: Role[] = result.data || [];
        setRoles(list);

        const firstEditable =
          list.find((role) => role.code !== "SUPER_ADMIN") || list[0];
        if (firstEditable) setSelectedRoleId(firstEditable.id);
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Failed to load roles"));
      } finally {
        setLoadingRoles(false);
      }
    }

    loadRoles();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) return;

    let active = true;

    async function loadMatrix() {
      setLoadingMatrix(true);
      setError("");
      setSuccess("");

      try {
        const result = await api.get(
          `/roles/${selectedRoleId}/permission-matrix`,
        );
        if (active) setPermissions(result.data || []);
      } catch (loadError) {
        if (active) {
          setError(
            getErrorMessage(loadError, "Failed to load role permissions"),
          );
        }
      } finally {
        if (active) setLoadingMatrix(false);
      }
    }

    loadMatrix();

    return () => {
      active = false;
    };
  }, [selectedRoleId]);

  const grouped = useMemo(() => {
    const map = new Map<string, MatrixPermission[]>();

    for (const permission of permissions) {
      const list = map.get(permission.module) || [];
      list.push(permission);
      map.set(permission.module, list);
    }

    return [...map.entries()];
  }, [permissions]);

  const handleToggle = async (permission: MatrixPermission) => {
    const key = `${permission.module}:${permission.action}`;
    const isBase = BASE_PERMISSION_SET.has(key);

    if (!canUpdate || isSuperAdminRole || isBase || savingId) return;

    setSavingId(permission.id);
    setError("");
    setSuccess("");

    try {
      if (permission.assigned) {
        await api.delete(`/roles/${selectedRoleId}/permissions`, {
          permissionId: permission.id,
        });
      } else {
        await api.post(`/roles/${selectedRoleId}/permissions`, {
          permissionId: permission.id,
        });
      }

      setPermissions((prev) =>
        prev.map((item) =>
          item.id === permission.id
            ? { ...item, assigned: !item.assigned }
            : item,
        ),
      );
      setSuccess(
        `${permission.module}:${permission.action} ${
          permission.assigned ? "dicabut" : "diberikan"
        }.`,
      );
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Failed to update permission"));
    } finally {
      setSavingId(null);
    }
  };

  if (loadingRoles) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading roles...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Permissions</h1>
        <p className="mt-1 text-sm text-slate-600">
          Atur hak akses berdasarkan role. Hak dasar untuk melihat Dashboard,
          Documents, Public Library, Favorites, dan Recent selalu aktif untuk
          semua user dan tidak dapat dicabut.
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Role
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {roles.map((role) => {
                const active = role.id === selectedRoleId;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      active
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : "border-l-4 border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {role.name}
                    </p>
                    <p className="text-xs text-slate-500">{role.code}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedRole?.name || "Select a role"}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedRole?.description || selectedRole?.code}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                  {permissions.filter((item) => item.assigned).length} izin
                  aktif
                </span>
                {!canUpdate && (
                  <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                    Read only
                  </span>
                )}
              </div>
            </div>

            {isSuperAdminRole && (
              <div className="mx-5 mt-4 p-3 rounded bg-blue-50 text-blue-800 border border-blue-100 text-sm">
                Super Admin selalu memiliki semua izin dan tidak dapat diubah.
              </div>
            )}

            {loadingMatrix ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-600">Loading permissions...</p>
              </div>
            ) : grouped.length === 0 ? (
              <p className="px-5 py-10 text-center text-slate-500">
                No permissions found
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {grouped.map(([module, items]) => (
                  <div key={module} className="px-5 py-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      {MODULE_LABELS[module] || module}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {items.map((permission) => {
                        const key = `${permission.module}:${permission.action}`;
                        const isBase = BASE_PERMISSION_SET.has(key);
                        const checked =
                          isBase || isSuperAdminRole || permission.assigned;
                        const locked =
                          isBase || isSuperAdminRole || !canUpdate;
                        const saving = savingId === permission.id;

                        return (
                          <label
                            key={permission.id}
                            className={`flex items-start gap-3 rounded-md border p-3 transition-colors ${
                              locked
                                ? "border-slate-100 bg-slate-50"
                                : "border-slate-200 hover:border-blue-300 cursor-pointer"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={locked || saving}
                              onChange={() => handleToggle(permission)}
                              className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-60"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-slate-900">
                                  {permission.description ||
                                    permission.action}
                                </span>
                                {isBase && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold uppercase">
                                    Dasar
                                  </span>
                                )}
                                {saving && (
                                  <span className="text-[10px] text-slate-500">
                                    Menyimpan...
                                  </span>
                                )}
                              </span>
                              <span className="block text-xs text-slate-500 font-mono">
                                {permission.module}:{permission.action}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
