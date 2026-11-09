import { RecentViewRepository } from "../repositories/recent-view.repository.js";

export class RecentViewService {
  private repository =
    new RecentViewRepository();

  async logView(
    userId: string,
    documentId: string,
  ) {
    const existing =
      await this.repository.findByUserAndDocument(userId, documentId);

    if (existing) {
      return this.repository.updateViewedAt(userId, documentId);
    }

    return this.repository.create({
      user_id: userId,
      document_id: documentId,
    });
  }

  async getRecentViews(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const data =
      await this.repository.findByUser(userId);

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