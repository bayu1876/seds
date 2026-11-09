import { PublicLibraryRepository } from "../repositories/public-library.repository.js";
import { AuditLogRepository } from "../../audit-log/repositories/audit-log.repository.js";

export type PublicationDTO = {
  id: string;
  document_id: string;
  document_number: string | null;
  title: string;
  description: string | null;
  department_name: string | null;
  category_name: string | null;
  is_published: boolean;
  featured: boolean;
  display_order: number;
  published_at: Date | null;
};

export class PublicLibraryAdminService {
  private repository = new PublicLibraryRepository();
  private auditLogRepository = new AuditLogRepository();

  async getAll(): Promise<PublicationDTO[]> {
    return this.repository.findAllForAdmin();
  }

  async publishDocument(
    userId: string,
    documentId: string,
    versionId: string,
    featured: boolean,
    displayOrder: number,
  ) {
    const exists = await this.repository.existsForDocument(documentId, true);
    if (exists) {
      throw new Error("Document is already published");
    }

    const publication = await this.repository.publish(
      userId,
      documentId,
      versionId,
      featured,
      displayOrder,
    );

    await this.auditLogRepository.create({
      user_id: userId,
      action: "PUBLISH_DOCUMENT",
      document_id: documentId,
      description: `Published document ${documentId} to public library`,
    });

    return publication;
  }

  async updatePublication(
    id: string,
    userId: string,
    data: {
      is_published?: boolean;
      featured?: boolean;
      display_order?: number;
    },
  ) {
    const publication = await this.repository.update(id, data);

    await this.auditLogRepository.create({
      user_id: userId,
      action: "UPDATE_PUBLICATION",
      document_id: publication.document_id,
      description: `Updated publication ${id}`,
    });

    return publication;
  }

  async unpublishDocument(id: string, userId: string) {
    const publication = await this.repository.findById(id);
    if (!publication) {
      throw new Error("Publication not found");
    }

    await this.repository.delete(id);

    await this.auditLogRepository.create({
      user_id: userId,
      action: "UNPUBLISH_DOCUMENT",
      document_id: publication.document_id,
      description: `Unpublished document ${publication.document_id} from public library`,
    });

    return { success: true };
  }

  async toggleFeatured(id: string, userId: string, featured: boolean) {
    const publication = await this.repository.setFeatured(id, featured);

    await this.auditLogRepository.create({
      user_id: userId,
      action: featured ? "FEATURE_DOCUMENT" : "UNFEATURE_DOCUMENT",
      document_id: publication.document_id,
      description: `${featured ? "Featured" : "Unfeatured"} document ${publication.document_id}`,
    });

    return publication;
  }
}
