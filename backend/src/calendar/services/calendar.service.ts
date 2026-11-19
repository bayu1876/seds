import { CalendarRepository } from "../repositories/calendar.repository.js";

type CreateInput = {
  title?: string;
  description?: string | null;
  location?: string | null;
  starts_at?: string | Date;
  ends_at?: string | Date | null;
  all_day?: boolean;
  color?: string | null;
  is_active?: boolean;
  created_by?: string | null;
};

type UpdateInput = {
  title?: string;
  description?: string | null;
  location?: string | null;
  starts_at?: string | Date;
  ends_at?: string | Date | null;
  all_day?: boolean;
  color?: string | null;
  is_active?: boolean;
  updated_by?: string | null;
};

function parseDate(value?: string | Date | null, required = false): Date | null {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error("Start date is required");
    return null;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date format");
  }
  return d;
}

export class CalendarService {
  private repository = new CalendarRepository();

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new Error("Calendar event not found");
    return item;
  }

  async create(input: CreateInput) {
    const title = (input.title || "").trim();
    if (!title) throw new Error("Title is required");
    const starts_at = parseDate(input.starts_at, true)!;
    const ends_at = parseDate(input.ends_at);
    if (ends_at && ends_at < starts_at) {
      throw new Error("End date must be after start date");
    }
    return this.repository.create({
      title,
      description: input.description?.trim() || null,
      location: input.location?.trim() || null,
      starts_at,
      ends_at,
      all_day: !!input.all_day,
      color: input.color?.trim() || null,
      is_active: input.is_active ?? true,
      created_by: input.created_by ?? null,
    });
  }

  async update(id: string, input: UpdateInput) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error("Calendar event not found");
    const title = (input.title || existing.title || "").trim();
    if (!title) throw new Error("Title is required");
    const starts_at = parseDate(input.starts_at === undefined ? existing.starts_at : input.starts_at, true)!;
    const ends_at = parseDate(input.ends_at === undefined ? existing.ends_at : input.ends_at);
    if (ends_at && ends_at < starts_at) {
      throw new Error("End date must be after start date");
    }
    return this.repository.update(id, {
      title,
      description: input.description === undefined ? existing.description : (input.description?.trim() || null),
      location: input.location === undefined ? existing.location : (input.location?.trim() || null),
      starts_at,
      ends_at,
      all_day: input.all_day === undefined ? existing.all_day : !!input.all_day,
      color: input.color === undefined ? existing.color : (input.color?.trim() || null),
      is_active: input.is_active === undefined ? existing.is_active : !!input.is_active,
      updated_by: input.updated_by ?? null,
    });
  }

  async softDelete(id: string, input: { deleted_by: string }) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error("Calendar event not found");
    return this.repository.softDelete(id, input.deleted_by);
  }
}
