import prisma from "../../config/prisma.js";

export class RoleRepository {
  async findAll() {
    return prisma.role.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        code: "asc",
      },
    });
  }

  async findById(id: string) {
    return prisma.role.findUnique({
      where: {
        id,
        deleted_at: null,
      },
    });
  }

}
