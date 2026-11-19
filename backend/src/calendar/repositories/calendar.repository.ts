import prisma from "../../config/prisma.js";

export class CalendarRepository {
  async findAll() {
    return prisma.calendarEvent.findMany({
      where: { deleted_at: null },
      orderBy: [{ starts_at: "asc" }, { created_at: "desc" }],
    });
  }

  async findById(id: string) {
    return prisma.calendarEvent.findFirst({
      where: { id, deleted_at: null },
    });
  }

  async create(data: {
    title: string;
    description?: string | null;
    location?: string | null;
    starts_at: Date;
    ends_at?: Date | null;
    all_day: boolean;
    color?: string | null;
    is_active: boolean;
    created_by?: string | null;
  }) {
    return prisma.calendarEvent.create({ data });
  }

  async update(
    id: string,
    data: {
      title: string;
      description?: string | null;
      location?: string | null;
      starts_at: Date;
      ends_at?: Date | null;
      all_day: boolean;
      color?: string | null;
      is_active: boolean;
      updated_by?: string | null;
    },
  ) {
    return prisma.calendarEvent.update({ where: { id }, data });
  }

  async softDelete(id: string, deleted_by: string) {
    return prisma.calendarEvent.update({
      where: { id },
      data: { deleted_at: new Date(), deleted_by },
    });
  }
}
