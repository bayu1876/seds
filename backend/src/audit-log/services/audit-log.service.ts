import { AuditLogRepository } from "../repositories/audit-log.repository.js";

export class AuditLogService {
  private repository =
    new AuditLogRepository();

  async logAction(
    data: {
      user_id: string;
      document_id?: string | null;
      action: string;
      ip_address?: string | null;
      user_agent?: string | null;
      description?: string | null;
    },
  ) {
    return this.repository.create(data);
  }

  async getUserActions(
    userId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const data =
      await this.repository.findByUser(userId, limit);

    const total = data.length;

    const totalPages = Math.ceil(total / limit);

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: data.slice(start, end),
      meta: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    };
  }

  async getDocumentActions(
    documentId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const data =
      await this.repository.findByDocument(documentId, limit);

    const total = data.length;

    const totalPages = Math.ceil(total / limit);

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: data.slice(start, end),
      meta: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    };
  }
}