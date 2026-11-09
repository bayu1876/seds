import { DocumentRepository } from "../repositories/document.repository.js";

type CreateDocumentInput = {
  document_number?: string | null;
  title: string;
  description?: string | null;
  department_id: string;
  category_id: string;
  confidential_level_id: string;
  effective_date?: Date | null;
  expired_date?: Date | null;
  is_active: boolean;
  created_by?: string | null;
};

type UpdateDocumentInput = {
  document_number?: string | null;
  title: string;
  description?: string | null;
  department_id: string;
  category_id: string;
  confidential_level_id: string;
  effective_date?: Date | null;
  expired_date?: Date | null;
  is_active: boolean;
  updated_by?: string | null;
};

type DeleteDocumentInput = {
  deleted_by: string;
};

export class DocumentService {
  private repository =
    new DocumentRepository();

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const document =
      await this.repository.findById(id);

    if (!document) {
      throw new Error(
        "Document not found",
      );
    }

    return document;
  }

  async create(
    input: CreateDocumentInput,
  ) {
    if (
      input.document_number
    ) {
      const existing =
        await this.repository.findByDocumentNumber(
          input.document_number,
        );

      if (existing) {
        throw new Error(
          "Document number already exists",
        );
      }
    }

    return this.repository.create(
      input,
    );
  }

  async update(
    id: string,
    input: UpdateDocumentInput,
  ) {
    const document =
      await this.repository.findById(id);

    if (!document) {
      throw new Error(
        "Document not found",
      );
    }

    if (
      input.document_number &&
      input.document_number !==
        document.document_number
    ) {
      const existing =
        await this.repository.findByDocumentNumber(
          input.document_number,
        );

      if (existing) {
        throw new Error(
          "Document number already exists",
        );
      }
    }

    return this.repository.update(
      id,
      input,
    );
  }

  async softDelete(
    id: string,
    input: DeleteDocumentInput,
  ) {
    const document =
      await this.repository.findById(id);

    if (!document) {
      throw new Error(
        "Document not found",
      );
    }

    return this.repository.softDelete(
      id,
      input.deleted_by,
    );
  }
}
