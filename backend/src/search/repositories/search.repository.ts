import prisma from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

type SearchDocumentsParams = {
  q?: string | undefined;
  department_id?: string | undefined;
  category_id?: string | undefined;
  confidential_level_id?: string | undefined;
  is_active?: boolean | undefined;
  page: number;
  limit: number;
};

export class SearchRepository {
  async searchDocuments(
    params: SearchDocumentsParams,
  ) {
    const where: Prisma.DocumentWhereInput =
      {
        deleted_at: null,
      };

    if (params.q) {
      where.OR = [
        {
          document_number: {
            contains: params.q,
            mode: "insensitive",
          },
        },
        {
          title: {
            contains: params.q,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: params.q,
            mode: "insensitive",
          },
        },
      ];
    }

    if (params.department_id) {
      where.department_id =
        params.department_id;
    }

    if (params.category_id) {
      where.category_id =
        params.category_id;
    }

    if (
      params.confidential_level_id
    ) {
      where.confidential_level_id =
        params.confidential_level_id;
    }

    if (
      params.is_active !== undefined
    ) {
      where.is_active =
        params.is_active;
    }

    const [data, total] =
      await prisma.$transaction([
        prisma.document.findMany({
          where,
          include: {
            department: true,
            category: true,
            confidentialLevel: true,
          },
          orderBy: {
            created_at: "desc",
          },
          skip:
            (params.page - 1) *
            params.limit,
          take: params.limit,
        }),
        prisma.document.count({
          where,
        }),
      ]);

    return {
      data,
      total,
    };
  }
}
