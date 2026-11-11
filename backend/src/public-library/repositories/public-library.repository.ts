import prisma from "../../config/prisma.js";

export type PublicationItem = {
  id: string;
  document_id: string;
  version_id: string;
  department_id: string | null;
  document_number: string | null;
  title: string;
  description: string | null;
  department_name: string | null;
  category_name: string | null;
  mime_type: string | null;
  thumbnail_path: string | null;
  tags: string[];
  is_published: boolean;
  featured: boolean;
  display_order: number;
  published_at: Date | null;
};

function mapPublication(pub: any): PublicationItem {
  return {
    id: pub.id,
    document_id: pub.document_id,
    version_id: pub.version_id,
    department_id: pub.document?.department_id ?? null,
    document_number: pub.document?.document_number ?? null,
    title: pub.document?.title ?? "",
    description: pub.document?.description ?? null,
    department_name: pub.document?.department?.name || null,
    category_name: pub.document?.category?.name || null,
    mime_type: pub.documentVersion?.mime_type || null,
    thumbnail_path: pub.documentVersion?.thumbnail_path || null,
    tags: (pub.document?.documentTags || [])
      .map((dt: any) => dt?.tag?.name)
      .filter((n: any): n is string => typeof n === "string" && n.length > 0),
    is_published: pub.is_published,
    featured: pub.featured,
    display_order: pub.display_order,
    published_at: pub.published_at,
  };
}

const include = {
  document: {
    include: {
      department: true,
      category: true,
      documentTags: { include: { tag: true } },
    },
  },
  documentVersion: true,
} as const;

export class PublicLibraryRepository {
  async findPublished(): Promise<PublicationItem[]> {
    const result = await prisma.publication.findMany({
      where: {
        is_published: true,
        document: {
          is_active: true,
          deleted_at: null,
        },
      },
      include,
      orderBy: [
        { featured: "desc" },
        { display_order: "asc" },
        { published_at: "desc" },
      ],
    });

    return result.map(mapPublication);
  }

  async findAllForAdmin(): Promise<PublicationItem[]> {
    const result = await prisma.publication.findMany({
      include,
      orderBy: [
        { published_at: "desc" },
      ],
    });

    return result.map(mapPublication);
  }

  async findById(id: string): Promise<PublicationItem | null> {
    const result = await prisma.publication.findUnique({
      where: { id },
      include,
    });

    if (!result) return null;

    return mapPublication(result);
  }

  async publish(
    userId: string,
    documentId: string,
    versionId: string,
    featured: boolean,
    displayOrder: number,
  ) {
    return prisma.publication.create({
      data: {
        user_id: userId,
        document_id: documentId,
        version_id: versionId,
        is_published: true,
        featured,
        display_order: displayOrder,
        published_at: new Date(),
      },
    });
  }

  async update(
    id: string,
    data: {
      is_published?: boolean;
      featured?: boolean;
      display_order?: number;
    },
  ) {
    return prisma.publication.update({
      where: { id },
      data,
    });
  }

  async setFeatured(id: string, featured: boolean) {
    return prisma.publication.update({
      where: { id },
      data: { featured },
    });
  }

  async delete(id: string) {
    return prisma.publication.delete({
      where: { id },
    });
  }

  async existsForDocument(documentId: string, isPublished: boolean = true): Promise<boolean> {
    const count = await prisma.publication.count({
      where: {
        document_id: documentId,
        is_published: isPublished,
      },
    });
    return count > 0;
  }
}
