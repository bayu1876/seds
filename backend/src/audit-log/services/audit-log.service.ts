import { AuditLogRepository } from "../repositories/audit-log.repository.js";

function formatName(
  user?: { full_name?: string | null; username?: string | null } | null,
) {
  if (!user) return null;
  return user.full_name || user.username || null;
}

function formatDocument(
  doc?: { title?: string | null; document_number?: string | null } | null,
) {
  if (!doc) return null;
  if (doc.title && doc.document_number) {
    return `${doc.title} (${doc.document_number})`;
  }
  return doc.title || doc.document_number || null;
}

export class AuditLogService {
  private repository = new AuditLogRepository();

  private enrich(log: any) {
    const userName = formatName(log.user);
    const documentName = formatDocument(log.document);

    let description: string | null = log.description ?? null;
    if (description) {
      if (log.document_id && documentName) {
        description = description.split(log.document_id).join(documentName);
      }
      if (log.document?.document_number && log.document?.title) {
        description = description
          .split(log.document.document_number)
          .join(log.document.title);
      }
      if (log.user_id && userName) {
        description = description.split(log.user_id).join(userName);
      }
    }

    return {
      ...log,
      user_name: userName,
      document_name: documentName,
      document_title: log.document?.title ?? null,
      description,
    };
  }

  async logAction(data: {
    user_id: string;
    document_id?: string | null;
    action: string;
    ip_address?: string | null;
    user_agent?: string | null;
    description?: string | null;
  }) {
    return this.repository.create(data);
  }

  async getUserActions(userId: string, page: number = 1, limit: number = 50) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
    const skip = (safePage - 1) * safeLimit;

    const [rows, total] = await Promise.all([
      this.repository.findByUser(userId, safeLimit, skip),
      this.repository.count({ user_id: userId }),
    ]);

    return {
      data: rows.map((r) => this.enrich(r)),
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        total_pages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getDocumentActions(
    documentId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
    const skip = (safePage - 1) * safeLimit;

    const [rows, total] = await Promise.all([
      this.repository.findByDocument(documentId, safeLimit, skip),
      this.repository.count({ document_id: documentId }),
    ]);

    return {
      data: rows.map((r) => this.enrich(r)),
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        total_pages: Math.ceil(total / safeLimit),
      },
    };
  }
}
