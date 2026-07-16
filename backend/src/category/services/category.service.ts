import { CategoryRepository } from "../repositories/category.repository.js";

type CreateCategoryInput = {
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  display_order: number;
  is_system: boolean;
  is_active: boolean;
  created_by?: string | null;
};

type UpdateCategoryInput = {
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  display_order: number;
  is_system: boolean;
  is_active: boolean;
  updated_by?: string | null;
};

type DeleteCategoryInput = {
  deleted_by: string;
};

export class CategoryService {
  private repository =
    new CategoryRepository();

  async findAll() {
    return this.repository.findAll();
  }
  async findById(id: string) {
    const category =
      await this.repository.findById(id);

    if (!category) {
      throw new Error(
        "Category not found",
      );
    }

    return category;
  }

  async create(
    input: CreateCategoryInput,
  ) {
    const existing =
      await this.repository.findByCode(
        input.code,
      );

    if (existing) {
      throw new Error(
        "Category code already exists",
      );
    }

    return this.repository.create(input);
  }

  async update(
    id: string,
    input: UpdateCategoryInput,
  ) {
    const category =
      await this.repository.findById(id);

    if (!category) {
      throw new Error(
        "Category not found",
      );
    }

    const existing =
      await this.repository.findByCode(
        input.code,
      );

    if (
      existing &&
      existing.id !== id
    ) {
      throw new Error(
        "Category code already exists",
      );
    }

    return this.repository.update(
      id,
      input,
    );
  }

  async softDelete(
    id: string,
    input: DeleteCategoryInput,
  ) {
    const category =
      await this.repository.findById(id);

    if (!category) {
      throw new Error(
        "Category not found",
      );
    }

    return this.repository.softDelete(
      id,
      input.deleted_by,
    );
  }
}
