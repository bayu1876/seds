import prisma from "../../config/prisma.js";

export class ConfidentialLevelRepository {
  async findAll() {
    return prisma.confidentialLevel.findMany({
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
    return prisma.confidentialLevel.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });
  }
}
