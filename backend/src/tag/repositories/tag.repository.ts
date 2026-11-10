import prisma from "../../config/prisma.js";

export class TagRepository {
  async findAll() {
    return prisma.tag.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: [
        {
          name: "asc",
        },
      ],
    });
  }

  async findById(id: string) {
    return prisma.tag.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });
  }

  async findByName(name: string) {
    return prisma.tag.findFirst({
      where: {
        name,
        deleted_at: null,
      },
    });
  }

  async findByNameInsensitive(name: string) {
    return prisma.tag.findFirst({
      where: {
        deleted_at: null,
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
  }
  async create(data: {
    name: string;
    color?: string | null;
    description?: string | null;
    is_system: boolean;
    is_active: boolean;
    created_by?: string | null;
  }) {
    return prisma.tag.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      name: string;
      color?: string | null;
      description?: string | null;
      is_system: boolean;
      is_active: boolean;
      updated_by?: string | null;
    },
  ) {
    return prisma.tag.update({
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
    return prisma.tag.update({
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
