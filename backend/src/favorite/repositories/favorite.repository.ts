import prisma, {
  type DbClient,
} from "../../config/prisma.js";

export class FavoriteRepository {
  constructor(
    private readonly db: DbClient = prisma,
  ) {}

  async findByUserAndDocument(
    userId: string,
    documentId: string,
  ) {
    return this.db.favorite.findUnique({
      where: {
        user_id_document_id: {
          user_id: userId,
          document_id: documentId,
        },
      },
    });
  }

  async findByUser(userId: string) {
    return this.db.favorite.findMany({
      where: {
        user_id: userId,
      },
      include: {
        document: {
          include: {
            department: true,
            category: true,
            confidentialLevel: true,
          },
        },
      },
    });
  }

  async create(data: {
    user_id: string;
    document_id: string;
  }) {
    return this.db.favorite.create({
      data,
    });
  }

  async delete(userId: string, documentId: string) {
    return this.db.favorite.delete({
      where: {
        user_id_document_id: {
          user_id: userId,
          document_id: documentId,
        },
      },
    });
  }
}