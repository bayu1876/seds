import prisma from "../../config/prisma.js";

const includeRelations = {
  user: {
    select: {
      id: true,
      username: true,
      full_name: true,
      employee_number: true,
    },
  },
  document: {
    select: {
      id: true,
      title: true,
      document_number: true,
    },
  },
} as const;

export class AuditLogRepository {
  async create(data: {
    user_id: string;
    document_id?: string | null;
    action: string;
    ip_address?: string | null;
    user_agent?: string | null;
    description?: string | null;
  }) {
    return prisma.auditLog.create({
      data,
    });
  }

  async count(where: any = {}) {
    return prisma.auditLog.count({
      where,
    });
  }

  async findMany(
    where: any = {},
    orderBy: "created_at_desc" | "created_at_asc" = "created_at_desc",
    take: number = 100,
    skip: number = 0,
  ) {
    return prisma.auditLog.findMany({
      where,
      include: includeRelations,
      orderBy:
        orderBy === "created_at_desc"
          ? { created_at: "desc" }
          : { created_at: "asc" },
      take,
      skip,
    });
  }

  async findByUser(userId: string, take: number = 100, skip: number = 0) {
    return prisma.auditLog.findMany({
      where: {
        user_id: userId,
      },
      include: includeRelations,
      orderBy: {
        created_at: "desc",
      },
      take,
      skip,
    });
  }

  async findByDocument(
    documentId: string,
    take: number = 100,
    skip: number = 0,
  ) {
    return prisma.auditLog.findMany({
      where: {
        document_id: documentId,
      },
      include: includeRelations,
      orderBy: {
        created_at: "desc",
      },
      take,
      skip,
    });
  }
}
