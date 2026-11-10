import prisma from "../../config/prisma.js";
import type {
  Prisma,
} from "../../generated/prisma/client.js";

type DbClient =
  | typeof prisma
  | Prisma.TransactionClient;

export class DocumentVersionRepository {
  constructor(
    private readonly db: DbClient = prisma,
  ) {}
  async findById(id: string) {
    return this.db.documentVersion.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        document: true,
        uploadedBy: true,
      },
    });
  }

  async findForDownload(id: string) {
    return this.db.documentVersion.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        document: {
          select: {
            id: true,
            deleted_at: true,
          },
        },
      },
    });
  }

  async findForSetCurrent(id: string) {
    return this.db.documentVersion.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
        document: {
          select: {
            id: true,
            current_version_id: true,
            deleted_at: true,
          },
        },
      },
    });
  }

  async findByDocumentId(
    documentId: string,
  ) {
    return this.db.documentVersion.findMany({
      where: {
        document_id: documentId,
        deleted_at: null,
      },
      orderBy: {
        version_number: "desc",
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
      },
    });
  }

  /**
   * Find the latest version of a document.
   * 
   * Note: The Prisma schema has @@unique([document_id, version_number]) on ALL document versions,
   * including soft-deleted ones (where deleted_at is set). This function filters by deleted_at IS NULL
   * to return the latest active version for version numbering purposes. The unique constraint
   * ensures no duplicate (document_id, version_number) pairs exist regardless of soft-delete status.
   */
  async findLatestVersion(
    documentId: string,
  ) {
    return this.db.documentVersion.findFirst({
      where: {
        document_id: documentId,
        deleted_at: null,
      },
      orderBy: {
        version_number: "desc",
      },
    });
  }

  async findDocumentById(
    documentId: string,
  ) {
  
  return this.db.document.findFirst({
    where: {
      id: documentId,
      deleted_at: null,
    },
  });

  }

  async updateCurrentVersion(
    documentId: string,
    versionId: string,
  ) {
    return this.db.document.update({
      where: {
        id: documentId,
      },
      data: {
        current_version_id: versionId,
      },
    });
  }

  async updateThumbnail(
    id: string,
    data: {
      thumbnail_path: string | null;
      preview_status: string;
    },
  ) {
    return this.db.documentVersion.update({
      where: { id },
      data,
    });
  }

  async create(
    data: {
      document_id: string;
      version_number: number;
      original_filename: string;
      stored_filename: string;
      storage_path: string;
      mime_type: string;
      file_size: number;
      thumbnail_path?: string | null;
      preview_status: string;
      version_notes?: string | null;
      uploaded_by: string;
      created_by: string;
    },
  ) {
    return this.db.documentVersion.create({
      data,
    });
  }
}
