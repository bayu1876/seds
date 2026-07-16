import prisma from "../../config/prisma.js";

export class RolePermissionRepository {
  async findByRoleId(roleId: string) {
    return prisma.rolePermission.findMany({
      where: {
        role_id: roleId,
      },
      include: {
        permission: true,
      },
      orderBy: [
        {
          permission: {
            module: "asc",
          },
        },
        {
          permission: {
            action: "asc",
          },
        },
      ],
    });
  }

  async findAllPermissionsByRoleId(
    roleId: string,
  ) {
    const permissions =
      await prisma.permission.findMany({
        where: {
          deleted_at: null,
        },
        orderBy: [
          {
            module: "asc",
          },
          {
            action: "asc",
          },
        ],
        include: {
          rolePermissions: {
            where: {
              role_id: roleId,
            },
          },
        },
      });

    return permissions.map(
      (permission) => ({
        id: permission.id,
        module: permission.module,
        action: permission.action,
        description:
          permission.description,
        assigned:
          permission.rolePermissions
            .length > 0,
      }),
    );
  }

  async assignPermission(
    roleId: string,
    permissionId: string,
  ) {
    return prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: roleId,
          permission_id: permissionId,
        },
      },
      update: {},
      create: {
        role_id: roleId,
        permission_id: permissionId,
      },
    });
  }

  async unassignPermission(
    roleId: string,
    permissionId: string,
  ) {
    return prisma.rolePermission.deleteMany({
      where: {
        role_id: roleId,
        permission_id: permissionId,
      },
    });
  }
}
