import prisma from "../../config/prisma.js";

export class AuthRepository {
  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: {
        username,
        is_active: true,
        deleted_at: null,
      },
    });
  }

  async findUserWithPermissions(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
        is_active: true,
        deleted_at: null,
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        userDepartments: {
          include: {
            department: true,
          },
        },
      },
    });
  }
}
