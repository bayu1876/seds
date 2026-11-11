import { SUPER_ADMIN_ROLE } from "../../auth/utils/access.js";
import { RoleRepository } from "../../role/repositories/role.repository.js";
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

  private roleRepository =
    new RoleRepository();

  private async assertRoleIsEditable(
    roleId: string,
  ) {
    const role =
      await this.roleRepository.findById(
        roleId,
      );

    if (!role) {
      throw new Error("Role not found");
    }

    if (role.code === SUPER_ADMIN_ROLE) {
      throw new Error(
        "Super Admin always has every permission and cannot be modified",
      );
    }

    return role;
  }

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
    await this.assertRoleIsEditable(
      input.roleId,
    );

    return this.repository.assignPermission(
      input.roleId,
      input.permissionId,
    );
  }

  async unassignPermission(
    input: UnassignPermissionInput,
  ) {
    await this.assertRoleIsEditable(
      input.roleId,
    );

    return this.repository.unassignPermission(
      input.roleId,
      input.permissionId,
    );
  }
}
