import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

export class AuthRepository {
  async findByUsername(username: string) {
    return prisma.user.findFirst({
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
      },
    });
  }
}
