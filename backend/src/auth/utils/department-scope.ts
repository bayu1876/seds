import {
  isSuperAdmin,
  type SessionUser,
} from "./access.js";

export class DepartmentScopeError extends Error {
  constructor(
    message = "You only have access to documents in your assigned departments",
  ) {
    super(message);
    this.name = "DepartmentScopeError";
  }
}

export function getUserDepartmentIds(user: SessionUser): string[] {
  return user.userDepartments.map(
    (userDepartment) => userDepartment.department.id,
  );
}

export function canAccessDepartment(
  user: SessionUser,
  departmentId: string | null | undefined,
): boolean {
  if (isSuperAdmin(user)) return true;
  if (!departmentId) return false;

  return getUserDepartmentIds(user).includes(departmentId);
}

export function assertDepartmentAccess(
  user: SessionUser,
  departmentId: string | null | undefined,
): void {
  if (!canAccessDepartment(user, departmentId)) {
    throw new DepartmentScopeError();
  }
}
