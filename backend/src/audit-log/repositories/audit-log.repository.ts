import prisma from "../../config/prisma.js";

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

  async findMany(
    where: any = {},
    orderBy: "created_at_desc" | "created_at_asc" = "created_at_desc",
    take: number = 100,
    skip: number = 0,
  ) {
    return prisma.auditLog.findMany({
      where,
      orderBy: orderBy === "created_at_desc" ? { created_at: "desc" } : { created_at: "asc" },
      take,
      skip,
    });
  }

  async count(where: any = {}) {
    return prisma.auditLog.count({
      where,
    });
  }

  async findByUser(userId: string, take: number = 100) {
    return prisma.auditLog.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
      take,
    });
  }

  async findByDocument(documentId: string, take: number = 100) {
    return prisma.auditLog.findMany({
      where: {
        document_id: documentId,
      },
      orderBy: {
        created_at: "desc",
      },
      take,
    });
  }
}