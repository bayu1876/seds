import { DepartmentRepository } from "../repositories/department.repository.js";

type CreateDepartmentInput = {
  code: string;
  name: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
  created_by?: string | null;
};

type UpdateDepartmentInput = {
  id: string;

  code: string;
  name: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;

  updated_by?: string | null;
};

type UpdateDepartmentStatusInput = {
  id: string;
  is_active: boolean;
  updated_by?: string | null;
};

type SoftDeleteDepartmentInput = {
  id: string;
  deleted_by?: string | null;
};

export class DepartmentService {
  private repository = new DepartmentRepository();

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const department =
      await this.repository.findById(id);

    if (!department) {
      throw new Error("Department not found");
    }

    return department;
  }

  async create(
    input: CreateDepartmentInput,
  ) {
    const existing =
      await this.repository.findByCode(
        input.code,
      );

    if (existing) {
      throw new Error(
        "Department code already exists",
      );
    }

    return this.repository.create(input);
  }

  async update(
    input: UpdateDepartmentInput,
  ) {
    const department =
      await this.repository.findById(
        input.id,
      );

    if (!department) {
      throw new Error("Department not found");
    }

    const existing =
      await this.repository.findByCode(
        input.code,
      );

    if (
      existing &&
      existing.id !== input.id
    ) {
      throw new Error(
        "Department code already exists",
      );
    }

    const data = {
      code: input.code,
      name: input.name,
      display_order: input.display_order,
      is_active: input.is_active,

      ...(input.description !== undefined && {
        description: input.description,
      }),

      ...(input.updated_by !== undefined && {
        updated_by: input.updated_by,
      }),
    };

    return this.repository.update(
      input.id,
      data,
    );
  }

  async updateStatus(
    input: UpdateDepartmentStatusInput,
  ) {
    const department =
      await this.repository.findById(
        input.id,
      );

    if (!department) {
      throw new Error("Department not found");
    }

    const data = {
      is_active: input.is_active,

      ...(input.updated_by !== undefined && {
        updated_by: input.updated_by,
      }),
    };

    return this.repository.updateStatus(
      input.id,
      data,
    );
  }

  async softDelete(
    input: SoftDeleteDepartmentInput,
  ) {
    const department =
      await this.repository.findById(
        input.id,
      );

    if (!department) {
      throw new Error("Department not found");
    }

    const data = {
      deleted_at: new Date(),

      ...(input.deleted_by !== undefined && {
        deleted_by: input.deleted_by,
      }),
    };

    return this.repository.softDelete(
      input.id,
      data,
    );
  }
}
