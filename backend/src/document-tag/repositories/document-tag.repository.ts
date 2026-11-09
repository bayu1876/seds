import prisma, {
  type DbClient,
} from "../../config/prisma.js";

export class DocumentTagRepository {
  constructor(
    private readonly db: DbClient = prisma,
  ) {}

  async findByDocumentAndTag(
    documentId: string,
    tagId: string,
  ) {
    return this.db.documentTag.findUnique({
      where: {
        document_id_tag_id: {
          document_id: documentId,
          tag_id: tagId,
        },
      },
    });
  }

  async findByDocumentId(
    documentId: string,
  ) {
    return this.db.documentTag.findMany({
      where: {
        document_id: documentId,
      },
      include: {
        tag: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });
  }

  async create(data: {
    document_id: string;
    tag_id: string;
    created_by?: string | null;
  }) {
    return this.db.documentTag.create({
      data,
    });
  }

  async delete(
    documentId: string,
    tagId: string,
  ) {
    return this.db.documentTag.delete({
      where: {
        document_id_tag_id: {
          document_id: documentId,
          tag_id: tagId,
        },
      },
    });
  }
}
