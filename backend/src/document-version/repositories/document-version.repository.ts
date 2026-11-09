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
    });
  }

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
