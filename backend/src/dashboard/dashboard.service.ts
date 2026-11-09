import prisma from "../config/prisma.js";

export type DashboardSection = {
  id: string;
  title: string;
  description: string | null;
  documentId: string;
  documentNumber: string | null;
  isPublished: boolean;
  createdAt: Date;
};

export type DashboardData = {
  featuredKnowledge: DashboardSection[];
  recentlyPublished: DashboardSection[];
  myFavorites: DashboardSection[];
  recentlyOpened: DashboardSection[];
};

export class DashboardService {
  async getDashboardData(
    userId: string,
  ): Promise<DashboardData> {
    const [featuredKnowledge, recentlyPublished, myFavorites, recentlyOpened] =
      await Promise.all([
        this.getFeaturedKnowledge(userId),
        this.getRecentlyPublished(userId),
        this.getMyFavorites(userId),
        this.getRecentlyOpened(userId),
      ]);

    return {
      featuredKnowledge,
      recentlyPublished,
      myFavorites,
      recentlyOpened,
    };
  }

  async getFeaturedKnowledge(
    userId: string,
  ): Promise<DashboardSection[]> {
    const result = await prisma.$queryRaw<Array<DashboardSection>>`SELECT
      p.id,
      d.title,
      d.description,
      d.document_number AS documentNumber,
      d.is_active AS isPublished,
      d.created_at AS createdAt
    FROM publication p
    JOIN document d ON d.id = p.document_id
    WHERE p.is_published = true
      AND p.featured = true
    ORDER BY p.published_at DESC
    LIMIT 5`;

    return result.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      documentId: row.id,
      documentNumber: row.documentNumber,
      isPublished: row.isPublished,
      createdAt: row.createdAt,
    }));
  }

  async getRecentlyPublished(
    userId: string,
  ): Promise<DashboardSection[]> {
    const result = await prisma.$queryRaw<Array<DashboardSection>>`SELECT
      p.id,
      d.title,
      d.description,
      d.document_number AS documentNumber,
      d.is_active AS isPublished,
      d.created_at AS createdAt
    FROM publication p
    JOIN document d ON d.id = p.document_id
    WHERE p.is_published = true
    ORDER BY p.published_at DESC
    LIMIT 5`;

    return result.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      documentId: row.id,
      documentNumber: row.documentNumber,
      isPublished: row.isPublished,
      createdAt: row.createdAt,
    }));
  }

  async getMyFavorites(
    userId: string,
  ): Promise<DashboardSection[]> {
    const result = await prisma.$queryRaw<Array<DashboardSection>>`SELECT
      d.id,
      d.title,
      d.description,
      d.document_number AS documentNumber,
      d.is_active AS isPublished,
      d.created_at AS createdAt
    FROM favorite f
    JOIN document d ON d.id = f.document_id
    WHERE f.user_id = ${userId}::uuid
    ORDER BY f.created_at DESC
    LIMIT 5`;

    return result.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      documentId: row.id,
      documentNumber: row.documentNumber,
      isPublished: row.isPublished,
      createdAt: row.createdAt,
    }));
  }

  async getRecentlyOpened(
    userId: string,
  ): Promise<DashboardSection[]> {
    const result = await prisma.$queryRaw<Array<DashboardSection>>`SELECT DISTINCT ON (d.id)
      d.id,
      d.title,
      d.description,
      d.document_number AS documentNumber,
      d.is_active AS isPublished,
      d.created_at AS createdAt
    FROM recent_view rv
    JOIN document d ON d.id = rv.document_id
    WHERE rv.user_id = ${userId}::uuid
    ORDER BY d.id, rv.viewed_at DESC
    LIMIT 5`;

    return result.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      documentId: row.id,
      documentNumber: row.documentNumber,
      isPublished: row.isPublished,
      createdAt: row.createdAt,
    }));
  }
}
