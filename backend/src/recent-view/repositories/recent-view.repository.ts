import prisma, {
  type DbClient,
} from "../../config/prisma.js";

export class RecentViewRepository {
  constructor(
    private readonly db: DbClient = prisma,
  ) {}

  async findByUserAndDocument(
    userId: string,
    documentId: string,
  ) {
    return this.db.recentView.findUnique({
      where: {
        user_id_document_id: {
          user_id: userId,
          document_id: documentId,
        },
      },
    });
  }

  async findByUser(userId: string) {
    return this.db.recentView.findMany({
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
      orderBy: {
        viewed_at: "desc",
      },
    });
  }

  async create(data: {
    user_id: string;
    document_id: string;
  }) {
    return this.db.recentView.create({
      data,
    });
  }

  async cleanOldViews(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.db.recentView.deleteMany({
      where: {
        viewed_at: {
          lt: cutoffDate,
        },
      },
    });
  }

  async updateViewedAt(
    userId: string,
    documentId: string,
  ) {
    return this.db.recentView.update({
      where: {
        user_id_document_id: {
          user_id: userId,
          document_id: documentId,
        },
      },
      data: {
        viewed_at: new Date(),
      },
    });
  }
}