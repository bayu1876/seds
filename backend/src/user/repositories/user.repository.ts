import prisma, { type DbClient } from "../../config/prisma.js";

export class UserRepository {
  async findAll() {
    return prisma.user.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        full_name: "asc",
      },
      select: {
        id: true,
        employee_number: true,
        username: true,
        full_name: true,
        email: true,
        phone: true,
        job_title: true,
        avatar: true,
        last_login_at: true,
        is_active: true,

        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },

        userDepartments: {
          select: {
            department: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        userRoles: {
          include: {
            role: true,
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

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: {
        username,
        deleted_at: null,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
        deleted_at: null,
      },
    });
  }

  async isUsernameExists(username: string) {
    const count = await prisma.user.count({
      where: {
        username,
        deleted_at: null,
      },
    });

    return count > 0;
  }

  async isEmailExists(email: string) {
    const count = await prisma.user.count({
      where: {
        email,
        deleted_at: null,
      },
    });

    return count > 0;
  }

  async isEmailExistsExcept(id: string, email: string) {
    const count = await prisma.user.count({
      where: {
        email,
        deleted_at: null,
        NOT: {
          id,
        },
      },
    });

    return count > 0;
  }

  async isEmployeeNumberExists(employeeNumber: string) {
    const count = await prisma.user.count({
      where: {
        employee_number: employeeNumber,
        deleted_at: null,
      },
    });

    return count > 0;
  }

  async isEmployeeNumberExistsExcept(id: string, employeeNumber: string) {
    const count = await prisma.user.count({
      where: {
        employee_number: employeeNumber,
        deleted_at: null,
        NOT: {
          id,
        },
      },
    });

    return count > 0;
  }

  async create(
    db: DbClient,
    data: {
      employee_number: string;
      username: string;
      password_hash: string;
      full_name: string;
      email: string;
      phone?: string | null;
      job_title?: string | null;
      avatar?: string | null;
      password_changed_at?: Date | null;
      is_active: boolean;
      created_by?: string | null;
    },
  ) {
    return db.user.create({
      data,
    });
  }

  async update(
    db: DbClient,
    id: string,
    data: {
      employee_number: string;
      full_name: string;
      email: string;
      phone?: string | null;
      job_title?: string | null;
      is_active: boolean;
      updated_by?: string | null;
    },
  ) {
    return db.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async resetPassword(
    db: DbClient,
    id: string,
    data: {
      password_hash: string;
      must_change_password: boolean;
      password_changed_at: Date;
      updated_by?: string | null;
    },
  ) {
    return db.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async updateStatus(
    db: DbClient,
    id: string,
    data: {
      is_active: boolean;
      updated_by?: string | null;
    },
  ) {
    return db.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(
    db: DbClient,
    id: string,
    data: {
      deleted_at: Date;
      deleted_by?: string | null;
    },
  ) {
    return db.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async updateMyProfile(
    db: DbClient,
    id: string,
    data: {
      full_name: string;
      email: string;
      phone?: string | null;
      avatar?: string | null;
      updated_by?: string | null;
    },
  ) {
    return db.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async changeMyPassword(
    db: DbClient,
    id: string,
    data: {
      password_hash: string;
      password_changed_at: Date;
      must_change_password: boolean;
      updated_by?: string | null;
    },
  ) {
    return db.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async assignRoles(
    db: DbClient,
    userId: string,
    roleIds: string[],
    createdBy?: string | null,
  ) {
    return db.userRole.createMany({
      data: roleIds.map((roleId) => ({
        user_id: userId,
        role_id: roleId,
        created_by: createdBy ?? null,
      })),
    });
  }

  async clearRoles(db: DbClient, userId: string) {
    return db.userRole.deleteMany({
      where: {
        user_id: userId,
      },
    });
  }

  async assignDepartments(
    db: DbClient,
    userId: string,
    departmentIds: string[],
    createdBy?: string | null,
  ) {
    return db.userDepartment.createMany({
      data: departmentIds.map((departmentId) => ({
        user_id: userId,
        department_id: departmentId,
        created_by: createdBy ?? null,
      })),
    });
  }

  async clearDepartments(db: DbClient, userId: string) {
    return db.userDepartment.deleteMany({
      where: {
        user_id: userId,
      },
    });
  }

  async existingRoleCount(roleIds: string[]) {
    return prisma.role.count({
      where: {
        id: {
          in: roleIds,
        },
        is_active: true,
        deleted_at: null,
      },
    });
  }

  async existingDepartmentCount(departmentIds: string[]) {
    return prisma.department.count({
      where: {
        id: {
          in: departmentIds,
        },
        is_active: true,
        deleted_at: null,
      },
    });
  }
}
