import prisma from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { Prisma as PrismaNamespace } from "../../generated/prisma/client.js";

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
        {
          documentTags: {
            some: {
              tag: {
                name: {
                  contains: params.q,
                  mode: "insensitive",
                },
                deleted_at: null,
              },
            },
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
            documentTags: { include: { tag: true } },
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

  async searchFulltext(
    params: SearchDocumentsParams & {
      q: string;
    },
  ) {
    const conditions: Prisma.Sql[] = [
      PrismaNamespace.sql`d."deleted_at" IS NULL`,
      PrismaNamespace.sql`d."search_vector" @@ websearch_to_tsquery('simple', ${params.q})`,
    ];

    if (params.department_id) {
      conditions.push(
        PrismaNamespace.sql`d."department_id" = ${params.department_id}`,
      );
    }

    if (params.category_id) {
      conditions.push(
        PrismaNamespace.sql`d."category_id" = ${params.category_id}`,
      );
    }

    if (
      params.confidential_level_id
    ) {
      conditions.push(
        PrismaNamespace.sql`d."confidential_level_id" = ${params.confidential_level_id}`,
      );
    }

    if (
      params.is_active !== undefined
    ) {
      conditions.push(
        PrismaNamespace.sql`d."is_active" = ${params.is_active}`,
      );
    }

    const where = PrismaNamespace.join(
      conditions,
      " AND ",
    );

    const rows =
      await prisma.$queryRaw<
        {
          id: string;
          total: bigint;
        }[]
      >`
        SELECT d."id", COUNT(*) OVER() AS total
        FROM "document" d
        WHERE ${where}
        ORDER BY
          ts_rank(
            d."search_vector",
            websearch_to_tsquery('simple', ${params.q})
          ) DESC,
          d."created_at" DESC
        LIMIT ${params.limit}
        OFFSET ${(params.page - 1) * params.limit}
      `;

    if (rows.length === 0) {
      return {
        data: [],
        total: 0,
      };
    }

    const ids = rows.map((row) => row.id);

    const documents =
      await prisma.document.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        include: {
          department: true,
          category: true,
          confidentialLevel: true,
          documentTags: { include: { tag: true } },
        },
      });

    const documentById = new Map(
      documents.map((document) => [
        document.id,
        document,
      ]),
    );

    const data = ids
      .map((id) => documentById.get(id))
      .filter(
        (
          document,
        ): document is (typeof documents)[number] =>
          document !== undefined,
      );

    return {
      data,
      total: Number(
        rows[0]!.total,
      ),
    };
  }
}
