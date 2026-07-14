import prisma from "../../config/prisma.js";

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

  async isEmployeeNumberExists(employeeNumber: string) {
    const count = await prisma.user.count({
      where: {
        employee_number: employeeNumber,
        deleted_at: null,
      },
    });

    return count > 0;
  }

  async create(data: {
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
  }) {
    return prisma.user.create({
      data,
    });
  }

}
