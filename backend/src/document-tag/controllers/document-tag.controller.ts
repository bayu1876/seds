import type {
  Request,
  Response,
} from "express";

import type { SessionUser } from "../../auth/utils/access.js";
import {
  assertDepartmentAccess,
  DepartmentScopeError,
} from "../../auth/utils/department-scope.js";
import { DocumentRepository } from "../../document/repositories/document.repository.js";
import { DocumentTagService } from "../services/document-tag.service.js";

export class DocumentTagController {
  private service =
    new DocumentTagService();

  private documentRepository =
    new DocumentRepository();

  private async getScopedDocument(
    user: SessionUser,
    documentId: string,
  ) {
    const document =
      await this.documentRepository.findById(
        documentId,
      );

    if (!document) {
      return null;
    }

    assertDepartmentAccess(
      user,
      document.department_id,
    );

    return document;
  }

  async assignTag(
    req: Request,
    res: Response,
  ) {
    try {
      const user = (req as Request & { user: SessionUser }).user;
      const documentId =
        typeof req.body?.document_id === "string"
          ? req.body.document_id
          : "";

      const document =
        await this.getScopedDocument(
          user,
          documentId,
        );

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      const documentTag =
        await this.service.assignTag({
          ...req.body,
          created_by: user.id,
        });

      return res.status(201).json({
        success: true,
        message:
          "Tag assigned successfully",
        data: documentTag,
      });
    } catch (error) {
      if (error instanceof DepartmentScopeError) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error instanceof Error &&
        (
          error.message ===
            "Document not found" ||
          error.message ===
            "Tag not found" ||
          error.message ===
            "Tag already assigned to document"
        )
      ) {
        return res.status(
          error.message ===
            "Tag already assigned to document"
            ? 400
            : 404,
        ).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
    }
  }

  async removeTag(
    req: Request<{
      documentId: string;
      tagId: string;
    }>,
    res: Response,
  ) {
    try {
      const user = (
        req as Request<{
          documentId: string;
          tagId: string;
        }> & { user: SessionUser }
      ).user;

      const document =
        await this.getScopedDocument(
          user,
          req.params.documentId,
        );

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      await this.service.removeTag({
        document_id: req.params.documentId,
        tag_id: req.params.tagId,
      });

      return res.json({
        success: true,
        message:
          "Tag removed successfully",
      });
    } catch (error) {
      if (error instanceof DepartmentScopeError) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error instanceof Error &&
        error.message ===
          "Tag is not assigned to document"
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
    }
  }
}
