import prisma from "../../config/prisma.js";

export class CategoryRepository {
  async findAll() {
    return prisma.category.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: [
        {
          display_order: "asc",
        },
        {
          name: "asc",
        },
      ],
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: {
        id,
        deleted_at: null,
      },
    });
  }

  async findByCode(code: string) {
    return prisma.category.findUnique({
      where: {
        code,
        deleted_at: null,
      },
    });
  }

  async create(data: {
    code: string;
    name: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    display_order: number;
    is_system: boolean;
    is_active: boolean;
    created_by?: string | null;
  }) {
    return prisma.category.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      code: string;
      name: string;
      description?: string | null;
      icon?: string | null;
      color?: string | null;
      display_order: number;
      is_system: boolean;
      is_active: boolean;
      updated_by?: string | null;
    },
  ) {
    return prisma.category.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(
    id: string,
    deletedBy: string,
  ) {
    return prisma.category.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
        deleted_by: deletedBy,
      },
    });
  }
}
