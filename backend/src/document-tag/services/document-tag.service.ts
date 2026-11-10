import { DocumentRepository } from "../../document/repositories/document.repository.js";
import { TagRepository } from "../../tag/repositories/tag.repository.js";
import { DocumentTagRepository } from "../repositories/document-tag.repository.js";

type AssignTagInput = {
  document_id: string;
  tag_id?: string;
  tag_name?: string;
  created_by?: string | null;
};

type RemoveTagInput = {
  document_id: string;
  tag_id: string;
};

export class DocumentTagService {
  private repository =
    new DocumentTagRepository();

  private documentRepository =
    new DocumentRepository();

  private tagRepository =
    new TagRepository();

  private normalizeTagName(name: string) {
    return (name || "").trim().replace(/\s+/g, " ");
  }

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

    let tagId = input.tag_id;

    if (input.tag_name) {
      const name = this.normalizeTagName(input.tag_name);
      if (!name) {
        throw new Error("Tag name is required");
      }
      let tag = await this.tagRepository.findByNameInsensitive(name);
      if (!tag) {
        tag = await this.tagRepository.create({
          name,
          color: null,
          description: null,
          is_system: false,
          is_active: true,
          created_by: input.created_by ?? null,
        });
      }
      tagId = tag.id;
    }

    if (!tagId) {
      throw new Error(
        "Tag not found",
      );
    }

    const tag =
      await this.tagRepository.findById(
        tagId,
      );

    if (!tag) {
      throw new Error(
        "Tag not found",
      );
    }

    const existing =
      await this.repository.findByDocumentAndTag(
        input.document_id,
        tagId,
      );

    if (existing) {
      throw new Error(
        "Tag already assigned to document",
      );
    }

    return this.repository.create({
      document_id: input.document_id,
      tag_id: tagId,
      created_by: input.created_by ?? null,
    });
  }

  async removeTag(
    input: RemoveTagInput,
  ) {
    const existing =
      await this.repository.findByDocumentAndTag(
        input.document_id,
        input.tag_id,
      );

    if (!existing) {
      throw new Error(
        "Tag is not assigned to document",
      );
    }

    return this.repository.delete(
      input.document_id,
      input.tag_id,
    );
  }
}
