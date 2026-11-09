import { SearchRepository } from "../repositories/search.repository.js";

type SearchDocumentsInput = {
  q?: string;
  department_id?: string;
  category_id?: string;
  confidential_level_id?: string;
  is_active?: string | boolean;
  page?: string | number;
  limit?: string | number;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class SearchService {
  private repository =
    new SearchRepository();

  async searchDocuments(
    input: SearchDocumentsInput,
  ) {
    const page = this.parseInteger(
      input.page,
      "page",
      1,
    );

    const limit = this.parseInteger(
      input.limit,
      "limit",
      1,
      100,
    );

    const is_active =
      this.parseBoolean(
        input.is_active,
        "is_active",
      );

    const department_id =
      this.parseUuid(
        input.department_id,
        "department_id",
      );

    const category_id =
      this.parseUuid(
        input.category_id,
        "category_id",
      );

    const confidential_level_id =
      this.parseUuid(
        input.confidential_level_id,
        "confidential_level_id",
      );

    const q = input.q?.trim();

    const result =
      await this.repository.searchDocuments(
        {
          q: q || undefined,
          department_id,
          category_id,
          confidential_level_id,
          is_active,
          page: page ?? 1,
          limit: limit ?? 20,
        },
      );

    const currentPage = page ?? 1;
    const currentLimit = limit ?? 20;

    return {
      data: result.data,
      meta: {
        page: currentPage,
        limit: currentLimit,
        total: result.total,
        total_pages: Math.ceil(
          result.total / currentLimit,
        ),
      },
    };
  }

  async searchFulltext(
    input: SearchDocumentsInput,
  ) {
    const q = input.q?.trim();

    if (!q) {
      throw new Error("q is required");
    }

    const page = this.parseInteger(
      input.page,
      "page",
      1,
    );

    const limit = this.parseInteger(
      input.limit,
      "limit",
      1,
      100,
    );

    const is_active =
      this.parseBoolean(
        input.is_active,
        "is_active",
      );

    const department_id =
      this.parseUuid(
        input.department_id,
        "department_id",
      );

    const category_id =
      this.parseUuid(
        input.category_id,
        "category_id",
      );

    const confidential_level_id =
      this.parseUuid(
        input.confidential_level_id,
        "confidential_level_id",
      );

    const result =
      await this.repository.searchFulltext(
        {
          q,
          department_id,
          category_id,
          confidential_level_id,
          is_active,
          page: page ?? 1,
          limit: limit ?? 20,
        },
      );

    const currentPage = page ?? 1;
    const currentLimit = limit ?? 20;

    return {
      data: result.data,
      meta: {
        page: currentPage,
        limit: currentLimit,
        total: result.total,
        total_pages: Math.ceil(
          result.total / currentLimit,
        ),
      },
    };
  }

  private parseInteger(
    value: string | number | undefined,
    name: string,
    minimum: number,
    maximum?: number,
  ) {
    if (
      value === undefined ||
      value === ""
    ) {
      return undefined;
    }

    const parsed = Number(value);

    if (
      !Number.isInteger(parsed) ||
      parsed < minimum ||
      (maximum !== undefined &&
        parsed > maximum)
    ) {
      throw new Error(
        `Invalid ${name}`,
      );
    }

    return parsed;
  }

  private parseBoolean(
    value: string | boolean | undefined,
    name: string,
  ) {
    if (
      value === undefined ||
      value === ""
    ) {
      return undefined;
    }

    if (
      value === true ||
      value === "true"
    ) {
      return true;
    }

    if (
      value === false ||
      value === "false"
    ) {
      return false;
    }

    throw new Error(`Invalid ${name}`);
  }

  private parseUuid(
    value: string | undefined,
    name: string,
  ) {
    if (!value) {
      return undefined;
    }

    if (!UUID_PATTERN.test(value)) {
      throw new Error(
        `Invalid ${name}`,
      );
    }

    return value;
  }
}
