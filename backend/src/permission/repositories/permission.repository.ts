import prisma from "../../config/prisma.js";

export class PermissionRepository {
  async findAll() {
    return prisma.permission.findMany({
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
    });
  }

  async findById(id: string) {
    return prisma.permission.findUnique({
      where: {
        id,
        deleted_at: null,
      },
    });
  }
}
