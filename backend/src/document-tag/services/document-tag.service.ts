import { DocumentRepository } from "../../document/repositories/document.repository.js";
import { TagRepository } from "../../tag/repositories/tag.repository.js";
import { DocumentTagRepository } from "../repositories/document-tag.repository.js";

type AssignTagInput = {
  document_id: string;
  tag_id: string;
  created_by?: string | null;
};

export class DocumentTagService {
  private repository =
    new DocumentTagRepository();

  private documentRepository =
    new DocumentRepository();

  private tagRepository =
    new TagRepository();

  async assignTag(
    input: AssignTagInput,
  ) {
    const document =
      await this.documentRepository.findById(
        input.document_id,
      );

    if (!document) {
      throw new Error(
        "Document not found",
      );
    }

    const tag =
      await this.tagRepository.findById(
        input.tag_id,
      );

    if (!tag) {
      throw new Error(
        "Tag not found",
      );
    }

    const existing =
      await this.repository.findByDocumentAndTag(
        input.document_id,
        input.tag_id,
      );

    if (existing) {
      throw new Error(
        "Tag already assigned to document",
      );
    }

    return this.repository.create(
      input,
    );
  }
}
