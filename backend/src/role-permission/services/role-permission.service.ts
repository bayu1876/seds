import { RolePermissionRepository } from "../repositories/role-permission.repository.js";

type AssignPermissionInput = {
  roleId: string;
  permissionId: string;
};

type UnassignPermissionInput = {
  roleId: string;
  permissionId: string;
};

export class RolePermissionService {
  private repository =
    new RolePermissionRepository();

  async findByRoleId(
    roleId: string,
  ) {
    return this.repository.findByRoleId(
      roleId,
    );
  }

  async findAllPermissionsByRoleId(
    roleId: string,
  ) {
    return this.repository
      .findAllPermissionsByRoleId(
        roleId,
      );
  }

  async assignPermission(
    input: AssignPermissionInput,
  ) {
    return this.repository.assignPermission(
      input.roleId,
      input.permissionId,
    );
  }

  async unassignPermission(
    input: UnassignPermissionInput,
  ) {
    return this.repository.unassignPermission(
      input.roleId,
      input.permissionId,
    );
  }
}
