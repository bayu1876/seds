import prisma from "../../config/prisma.js";

export class AnnouncementRepository {
  async findAll() {
    return prisma.announcement.findMany({
      where: { deleted_at: null },
      orderBy: [
        { is_active: "desc" },
        { display_order: "asc" },
        { created_at: "desc" },
      ],
    });
  }

  async findActive(now: Date = new Date()) {
    return prisma.announcement.findMany({
      where: {
        deleted_at: null,
        is_active: true,
        AND: [
          { OR: [{ starts_at: null }, { starts_at: { lte: now } }] },
          { OR: [{ ends_at: null }, { ends_at: { gte: now } }] },
        ],
      },
      orderBy: [
        { display_order: "asc" },
        { created_at: "desc" },
      ],
    });
  }

  async findById(id: string) {
    return prisma.announcement.findFirst({
      where: { id, deleted_at: null },
    });
  }

  async create(data: {
    title?: string | null;
    content: string;
    is_active: boolean;
    display_order: number;
    starts_at?: Date | null;
    ends_at?: Date | null;
    created_by?: string | null;
  }) {
    return prisma.announcement.create({ data });
  }

  async update(
    id: string,
    data: {
      title?: string | null;
      content: string;
      is_active: boolean;
      display_order: number;
      starts_at?: Date | null;
      ends_at?: Date | null;
      updated_by?: string | null;
    },
  ) {
    return prisma.announcement.update({ where: { id }, data });
  }

  async softDelete(id: string, deleted_by: string) {
    return prisma.announcement.update({
      where: { id },
      data: { deleted_at: new Date(), deleted_by },
    });
  }
}
