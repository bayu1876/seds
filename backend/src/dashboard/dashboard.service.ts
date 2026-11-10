import prisma from "../config/prisma.js";

export type DashboardSection = {
  id: string;
  title: string;
  description: string | null;
  documentId: string;
  publicationId?: string | null;
  versionId?: string | null;
  documentNumber: string | null;
  mimeType?: string | null;
  thumbnailPath?: string | null;
  isPublished: boolean;
  createdAt: Date;
};

export type DashboardData = {
  latestMemo: DashboardSection[];
  featuredKnowledge: DashboardSection[];
  recentlyPublished: DashboardSection[];
  myFavorites: DashboardSection[];
  recentlyOpened: DashboardSection[];
};

export class DashboardService {
  async getDashboardData(
    userId: string,
  ): Promise<DashboardData> {
    const [latestMemo, featuredKnowledge, recentlyPublished, myFavorites, recentlyOpened] =
      await Promise.all([
        this.getLatestMemo(),
        this.getFeaturedKnowledge(userId),
        this.getRecentlyPublished(userId),
        this.getMyFavorites(userId),
        this.getRecentlyOpened(userId),
      ]);

    return {
      latestMemo,
      featuredKnowledge,
      recentlyPublished,
      myFavorites,
      recentlyOpened,
    };
  }

  async getLatestMemo(): Promise<DashboardSection[]> {
    const result = await prisma.$queryRaw<Array<any>>`SELECT
      d.id,
      d.id AS "documentId",
      d.title,
      d.description,
      d.document_number AS "documentNumber",
      dv.id AS "versionId",
      dv.mime_type AS "mimeType",
      dv.thumbnail_path AS "thumbnailPath",
      d.is_active AS "isPublished",
      COALESCE(d.updated_at, d.created_at) AS "createdAt"
    FROM document d
    JOIN category c ON c.id = d.category_id
    LEFT JOIN LATERAL (
      SELECT dv.id, dv.mime_type, dv.thumbnail_path
      FROM document_version dv
      WHERE dv.document_id = d.id AND dv.deleted_at IS NULL
      ORDER BY (dv.id = d.current_version_id) DESC, dv.version_number DESC, dv.uploaded_at DESC
      LIMIT 1
    ) dv ON true
    WHERE d.deleted_at IS NULL
      AND (c.code = 'IOM' OR c.name ILIKE '%IOM%' OR c.name ILIKE '%Internal Office Memo%')
    ORDER BY d.created_at DESC
    LIMIT 1`;

    return result.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      documentId: row.documentId,
      publicationId: null,
      versionId: row.versionId,
      documentNumber: row.documentNumber,
      mimeType: row.mimeType,
      thumbnailPath: row.thumbnailPath,
      isPublished: row.isPublished,
      createdAt: row.createdAt,
    }));
  }

  async getFeaturedKnowledge(
    userId: string,
  ): Promise<DashboardSection[]> {
    const result = await prisma.$queryRaw<Array<any>>`SELECT
      p.id AS "id",
      p.id AS "publicationId",
      d.id AS "documentId",
      p.version_id AS "versionId",
      d.title,
      d.description,
      d.document_number AS "documentNumber",
      dv.mime_type AS "mimeType",
      dv.thumbnail_path AS "thumbnailPath",
      p.is_published AS "isPublished",
      p.published_at AS "createdAt"
    FROM publication p
    JOIN document d ON d.id = p.document_id
    LEFT JOIN document_version dv ON dv.id = p.version_id
    WHERE p.is_published = true
      AND p.featured = true
      AND d.deleted_at IS NULL
    ORDER BY p.published_at DESC
    LIMIT 5`;

    return result.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      documentId: row.documentId,
      publicationId: row.publicationId,
      versionId: row.versionId,
      documentNumber: row.documentNumber,
      mimeType: row.mimeType,
      thumbnailPath: row.thumbnailPath,
      isPublished: row.isPublished,
      createdAt: row.createdAt,
    }));
  }

  async getRecentlyPublished(
    userId: string,
  ): Promise<DashboardSection[]> {
    const result = await prisma.$queryRaw<Array<any>>`SELECT
      p.id AS "id",
      p.id AS "publicationId",
      d.id AS "documentId",
      p.version_id AS "versionId",
      d.title,
      d.description,
      d.document_number AS "documentNumber",
      dv.mime_type AS "mimeType",
      dv.thumbnail_path AS "thumbnailPath",
      p.is_published AS "isPublished",
      p.published_at AS "createdAt"
    FROM publication p
    JOIN document d ON d.id = p.document_id
    LEFT JOIN document_version dv ON dv.id = p.version_id
    WHERE p.is_published = true
      AND d.deleted_at IS NULL
    ORDER BY p.published_at DESC
    LIMIT 5`;

    return result.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      documentId: row.documentId,
      publicationId: row.publicationId,
      versionId: row.versionId,
      documentNumber: row.documentNumber,
      mimeType: row.mimeType,
      thumbnailPath: row.thumbnailPath,
      isPublished: row.isPublished,
      createdAt: row.createdAt,
    }));
  }

  async getMyFavorites(
    userId: string,
  ): Promise<DashboardSection[]> {
    const result = await prisma.$queryRaw<Array<any>>`SELECT
      d.id,
      d.id AS "documentId",
      d.title,
      d.description,
      d.document_number AS "documentNumber",
      d.is_active AS "isPublished",
      d.created_at AS "createdAt"
    FROM favorite f
    JOIN document d ON d.id = f.document_id
    WHERE f.user_id = ${userId}::uuid
      AND d.deleted_at IS NULL
    ORDER BY f.created_at DESC
    LIMIT 5`;

    return result.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      documentId: row.documentId,
      publicationId: null,
      versionId: null,
      documentNumber: row.documentNumber,
      mimeType: null,
      thumbnailPath: null,
      isPublished: row.isPublished,
      createdAt: row.createdAt,
    }));
  }

  async getRecentlyOpened(
    userId: string,
  ): Promise<DashboardSection[]> {
    const result = await prisma.$queryRaw<Array<any>>`SELECT DISTINCT ON (d.id)
      d.id,
      d.id AS "documentId",
      d.title,
      d.description,
      d.document_number AS "documentNumber",
      d.is_active AS "isPublished",
      rv.viewed_at AS "createdAt"
    FROM recent_view rv
    JOIN document d ON d.id = rv.document_id
    WHERE rv.user_id = ${userId}::uuid
      AND d.deleted_at IS NULL
    ORDER BY d.id, rv.viewed_at DESC
    LIMIT 5`;

    // re-order by viewed time desc after distinct selection
    result.sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result.slice(0,5).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      documentId: row.documentId,
      publicationId: null,
      versionId: null,
      documentNumber: row.documentNumber,
      mimeType: null,
      thumbnailPath: null,
      isPublished: row.isPublished,
      createdAt: row.createdAt,
    }));
  }
}
