import prisma from "../../config/prisma.js";

export class DocumentRepository {
  async findAll() {
    return prisma.document.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        department: true,
        category: true,
        confidentialLevel: true,
      },
      orderBy: [
        {
          title: "asc",
        },
      ],
    });
  }

  async findById(id: string) {
    return prisma.document.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        department: true,
        category: true,
        confidentialLevel: true,
      },
    });
  }

  async findByDocumentNumber(
    documentNumber: string,
  ) {
    return prisma.document.findFirst({
      where: {
        document_number: documentNumber,
        deleted_at: null,
      },
    });
  }

  async update(
    id: string,
    data: {
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
    },
  ) {
    return prisma.document.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(
    id: string,
    deletedBy: string,
  ) {
    return prisma.document.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
        deleted_by: deletedBy,
      },
    });
  }

  async create(data: {
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
  }) {
    return prisma.document.create({
      data,
    });
  }
}
