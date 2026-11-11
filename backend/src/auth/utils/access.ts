import type { AuthRepository } from "../repositories/auth.repository.js";

export type SessionUser = NonNullable<
  Awaited<ReturnType<AuthRepository["findUserWithPermissions"]>>
>;

export type AccessInfo = {
  permissions: string[];
  roles: string[];
  departments: { id: string; code: string; name: string }[];
};

export const SUPER_ADMIN_ROLE = "SUPER_ADMIN";

/**
 * Permissions every authenticated user always has, regardless of role.
 * These are read-only rights to the base areas of the application and cannot
 * be revoked through role-permission settings.
 */
export const BASE_PERMISSIONS = [
  "dashboard:view",
  "document:view",
  "document_version:view",
  "document_version:download",
] as const;

export const BASE_PERMISSION_SET = new Set<string>(BASE_PERMISSIONS);

export function isSuperAdmin(user: SessionUser): boolean {
  return user.userRoles.some(
    (userRole) => userRole.role.code === SUPER_ADMIN_ROLE,
  );
}

export function buildAccess(user: SessionUser): AccessInfo {
  const permissions = new Set<string>(BASE_PERMISSIONS);

  for (const userRole of user.userRoles) {
    for (const rolePermission of userRole.role.rolePermissions) {
      if (rolePermission.permission.is_active === false) continue;
      permissions.add(
        `${rolePermission.permission.module}:${rolePermission.permission.action}`,
      );
    }
  }

  return {
    permissions: [...permissions].sort(),
    roles: [...new Set(user.userRoles.map((userRole) => userRole.role.code))].sort(),
    departments: user.userDepartments.map((userDepartment) => ({
      id: userDepartment.department.id,
      code: userDepartment.department.code,
      name: userDepartment.department.name,
    })),
  };
}

export function toSafeUser(user: SessionUser) {
  const {
    password_hash: _passwordHash,
    userRoles: _userRoles,
    userDepartments: _userDepartments,
    ...safeUser
  } = user;

  return safeUser;
}
