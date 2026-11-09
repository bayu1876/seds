import { DocumentRepository } from "../../document/repositories/document.repository.js";
import { DocumentRelationRepository } from "../repositories/document-relation.repository.js";

type CreateRelationInput = {
  document_id: string;
  related_document_id: string;
  created_by?: string | null;
};

export class DocumentRelationService {
  private repository =
    new DocumentRelationRepository();

  private documentRepository =
    new DocumentRepository();

  async createRelation(
    input: CreateRelationInput,
  ) {
    if (
      input.document_id ===
      input.related_document_id
    ) {
      throw new Error(
        "Document cannot relate to itself",
      );
    }

    const document =
      await this.documentRepository.findById(
        input.document_id,
      );

    if (!document) {
      throw new Error(
        "Document not found",
      );
    }

    const relatedDocument =
      await this.documentRepository.findById(
        input.related_document_id,
      );

    if (!relatedDocument) {
      throw new Error(
        "Related document not found",
      );
    }

    const existing =
      await this.repository.findByDocumentAndRelated(
        input.document_id,
        input.related_document_id,
      );

    if (existing) {
      throw new Error(
        "Document relation already exists",
      );
    }

    return this.repository.create(input);
  }
}
