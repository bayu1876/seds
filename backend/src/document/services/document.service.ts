import { Prisma } from "../../generated/prisma/client.js";
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

const MAX_NUMBER_ATTEMPTS = 5;

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

  private sanitizeCode(value: string | undefined, fallback: string) {
    const cleaned = (value || "")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase();
    return cleaned || fallback;
  }

  private formatDateStamp(date: Date) {
    return date.toISOString().slice(0, 10).replace(/-/g, "");
  }

  private async generateSequentialDocumentNumber(
    departmentId: string,
    categoryId: string,
  ) {
    const [dept, cat] = await Promise.all([
      this.repository.findDepartmentCode(departmentId),
      this.repository.findCategoryCode(categoryId),
    ]);

    const deptCode = this.sanitizeCode(dept?.code, "GEN");
    const catCode = this.sanitizeCode(cat?.code, "DOC");
    const stamp = this.formatDateStamp(new Date());
    const prefix = `${deptCode}-${catCode}-${stamp}-`;

    const latest = await this.repository.findLatestByNumberPrefix(prefix);
    const latestNumber = latest?.document_number || "";
    const seqMatch = latestNumber.match(/-(\d+)$/);
    const nextSeq = seqMatch ? Number(seqMatch[1]) + 1 : 1;
    const seq = String(nextSeq).padStart(4, "0");

    return `${prefix}${seq}`;
  }

  async create(
    input: CreateDocumentInput,
  ) {
    const providedNumber = input.document_number?.trim() || null;

    if (providedNumber) {
      const existing =
        await this.repository.findByDocumentNumber(
          providedNumber,
        );

      if (existing) {
        throw new Error(
          "Document number already exists",
        );
      }

      return this.repository.create({
        ...input,
        document_number: providedNumber,
      });
    }

    for (let attempt = 1; attempt <= MAX_NUMBER_ATTEMPTS; attempt++) {
      const document_number = await this.generateSequentialDocumentNumber(
        input.department_id,
        input.category_id,
      );

      try {
        return await this.repository.create({
          ...input,
          document_number,
        });
      } catch (error) {
        const isUniqueConflict =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002";

        if (isUniqueConflict && attempt < MAX_NUMBER_ATTEMPTS) {
          continue;
        }

        if (isUniqueConflict) {
          throw new Error(
            "Failed to generate a unique document number, please retry",
          );
        }

        throw error;
      }
    }

    throw new Error(
      "Failed to generate a unique document number, please retry",
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
