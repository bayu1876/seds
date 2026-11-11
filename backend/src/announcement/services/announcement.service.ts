import { AnnouncementRepository } from "../repositories/announcement.repository.js";

type CreateInput = {
  title?: string | null;
  content: string;
  is_active: boolean;
  display_order?: number;
  starts_at?: string | Date | null;
  ends_at?: string | Date | null;
  created_by?: string | null;
};

type UpdateInput = {
  title?: string | null;
  content: string;
  is_active: boolean;
  display_order?: number;
  starts_at?: string | Date | null;
  ends_at?: string | Date | null;
  updated_by?: string | null;
};

function parseDate(value?: string | Date | null): Date | null {
  if (value === undefined || value === null || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date format");
  }
  return d;
}

export class AnnouncementService {
  private repository = new AnnouncementRepository();

  async findAll() {
    return this.repository.findAll();
  }

  async findActive() {
    return this.repository.findActive(new Date());
  }

  async findById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new Error("Announcement not found");
    return item;
  }

  async create(input: CreateInput) {
    const content = (input.content || "").trim();
    if (!content) throw new Error("Content is required");
    const starts_at = parseDate(input.starts_at);
    const ends_at = parseDate(input.ends_at);
    if (starts_at && ends_at && ends_at < starts_at) {
      throw new Error("End date must be after start date");
    }
    return this.repository.create({
      title: input.title?.trim() || null,
      content,
      is_active: input.is_active ?? true,
      display_order: Number.isFinite(Number(input.display_order)) ? Number(input.display_order) : 0,
      starts_at,
      ends_at,
      created_by: input.created_by ?? null,
    });
  }

  async update(id: string, input: UpdateInput) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error("Announcement not found");
    const content = (input.content || "").trim();
    if (!content) throw new Error("Content is required");
    const starts_at = parseDate(input.starts_at);
    const ends_at = parseDate(input.ends_at);
    if (starts_at && ends_at && ends_at < starts_at) {
      throw new Error("End date must be after start date");
    }
    return this.repository.update(id, {
      title: input.title?.trim() || null,
      content,
      is_active: input.is_active ?? existing.is_active,
      display_order: Number.isFinite(Number(input.display_order)) ? Number(input.display_order) : existing.display_order,
      starts_at,
      ends_at,
      updated_by: input.updated_by ?? null,
    });
  }

  async softDelete(id: string, input: { deleted_by: string }) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error("Announcement not found");
    return this.repository.softDelete(id, input.deleted_by);
  }
}
