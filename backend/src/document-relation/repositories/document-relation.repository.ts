import prisma, {
  type DbClient,
} from "../../config/prisma.js";

export class DocumentRelationRepository {
  constructor(
    private readonly db: DbClient = prisma,
  ) {}

  async findByDocumentAndRelated(
    documentId: string,
    relatedDocumentId: string,
  ) {
    return this.db.documentRelation.findUnique({
      where: {
        document_id_related_document_id:
          {
            document_id: documentId,
            related_document_id:
              relatedDocumentId,
          },
      },
    });
  }

  async delete(
    documentId: string,
    relatedDocumentId: string,
  ) {
    return this.db.documentRelation.delete({
      where: {
        document_id_related_document_id:
          {
            document_id: documentId,
            related_document_id:
              relatedDocumentId,
          },
      },
    });
  }

  async create(data: {
    document_id: string;
    related_document_id: string;
    created_by?: string | null;
  }) {
    return this.db.documentRelation.create({
      data,
    });
  }
}
