"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { auth, type AccessInfo } from "@/lib/api";
import type { PermissionRequirement } from "@/lib/route-access";

/**
 * Read-only permissions that every authenticated user always has. Mirrors the
 * backend BASE_PERMISSIONS. These cannot be revoked from the Permissions page.
 */
export const BASE_PERMISSIONS = [
  "dashboard:view",
  "document:view",
  "document_version:view",
  "document_version:download",
] as const;

export const BASE_PERMISSION_SET = new Set<string>(BASE_PERMISSIONS);

type PermissionsContextValue = {
  access: AccessInfo;
  ready: boolean;
  has: (module: string, action: string) => boolean;
  hasAll: (requirements: PermissionRequirement[]) => boolean;
  hasRole: (role: string) => boolean;
  refresh: () => Promise<void>;
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<AccessInfo>(() => auth.getAccess());
  const [ready, setReady] = useState(() => auth.getAccess().permissions.length > 0);

  useEffect(() => {
    let active = true;

    auth
      .refresh()
      .then((res) => {
        if (active && res?.access) setAccess(res.access);
      })
      .catch(() => {
        // Session invalid/expired is already handled centrally by the api client.
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<PermissionsContextValue>(
    () => ({
      access,
      ready,
      has: (module, action) => access.permissions.includes(`${module}:${action}`),
      hasAll: (requirements) =>
        requirements.every((req) =>
          access.permissions.includes(`${req.module}:${req.action}`),
        ),
      hasRole: (role) => access.roles.includes(role),
      refresh: async () => {
        const res = await auth.refresh();
        setAccess(res.access);
      },
    }),
    [access, ready],
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextValue {
  const context = useContext(PermissionsContext);

  if (context) return context;

  const access = auth.getAccess();

  return {
    access,
    ready: false,
    has: (module, action) => access.permissions.includes(`${module}:${action}`),
    hasAll: (requirements) =>
      requirements.every((req) =>
        access.permissions.includes(`${req.module}:${req.action}`),
      ),
    hasRole: (role) => access.roles.includes(role),
    refresh: async () => {},
  };
}

export function useDepartmentAccess() {
  const { access } = usePermissions();
  const isSuperAdmin = access.roles.includes("SUPER_ADMIN");
  const allowedDepartmentIds = access.departments.map(
    (department) => department.id,
  );

  return {
    isSuperAdmin,
    allowedDepartmentIds,
    canAccessDepartment: (departmentId: string | null | undefined) =>
      isSuperAdmin ||
      (!!departmentId && allowedDepartmentIds.includes(departmentId)),
  };
}

export function Can({
  module,
  action,
  children,
  fallback = null,
}: {
  module: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { has } = usePermissions();

  return <>{has(module, action) ? children : fallback}</>;
}

export function CanAll({
  requirements,
  children,
  fallback = null,
}: {
  requirements: PermissionRequirement[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasAll } = usePermissions();

  return <>{hasAll(requirements) ? children : fallback}</>;
}
