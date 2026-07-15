import prisma from "../../config/prisma.js";

export class DepartmentRepository {
  async findAll() {
    return prisma.department.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        code: "asc",
      },
    });
  }

  async findById(id: string) {
    return prisma.department.findUnique({
      where: {
        id,
        deleted_at: null,
      },
    });
  }

  async findByCode(code: string) {
    return prisma.department.findUnique({
      where: {
        code,
        deleted_at: null,
      },
    });
  }

  async create(
    data: {
      code: string;
      name: string;
      description?: string | null;
      display_order: number;
      is_active: boolean;
      created_by?: string | null;
    },
  ) {
    return prisma.department.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      code: string;
      name: string;
      description?: string | null;
      display_order: number;
      is_active: boolean;
      updated_by?: string | null;
    },
  ) {
    return prisma.department.update({
      where: {
        id,
      },
      data,
    });
  }

  async updateStatus(
    id: string,
    data: {
      is_active: boolean;
      updated_by?: string | null;
    },
  ) {
    return prisma.department.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(
    id: string,
    data: {
      deleted_at: Date;
      deleted_by?: string | null;
    },
  ) {
    return prisma.department.update({
      where: {
        id,
      },
      data,
    });
  }
}
