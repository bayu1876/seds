import { TagRepository } from "../repositories/tag.repository.js";

type CreateTagInput = {
  name: string;
  color?: string | null;
  description?: string | null;
  is_system: boolean;
  is_active: boolean;
  created_by?: string | null;
};

type UpdateTagInput = {
  name: string;
  color?: string | null;
  description?: string | null;
  is_system: boolean;
  is_active: boolean;
  updated_by?: string | null;
};

type DeleteTagInput = {
  deleted_by: string;
};

export class TagService {
  private repository =
    new TagRepository();

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const tag =
      await this.repository.findById(id);

    if (!tag) {
      throw new Error(
        "Tag not found",
      );
    }

    return tag;
  }

  async create(
    input: CreateTagInput,
  ) {
    const existing =
      await this.repository.findByName(
        input.name,
      );

    if (existing) {
      throw new Error(
        "Tag name already exists",
      );
    }

    return this.repository.create(input);
  }

  async update(
    id: string,
    input: UpdateTagInput,
  ) {
    const tag =
      await this.repository.findById(id);

    if (!tag) {
      throw new Error(
        "Tag not found",
      );
    }

    const existing =
      await this.repository.findByName(
        input.name,
      );

    if (
      existing &&
      existing.id !== id
    ) {
      throw new Error(
        "Tag name already exists",
      );
    }

    return this.repository.update(
      id,
      input,
    );
  }

  async softDelete(
    id: string,
    input: DeleteTagInput,
  ) {
    const tag =
      await this.repository.findById(id);

    if (!tag) {
      throw new Error(
        "Tag not found",
      );
    }

    return this.repository.softDelete(
      id,
      input.deleted_by,
    );
  }
}
