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
import { DocumentRelationService } from "../services/document-relation.service.js";

type CreateRelationRequest = Request & {
  user: SessionUser;
};

export class DocumentRelationController {
  private service =
    new DocumentRelationService();

  private documentRepository =
    new DocumentRepository();

  private async assertDocumentScope(
    user: SessionUser,
    documentId: string,
  ) {
    const document =
      await this.documentRepository.findById(
        documentId,
      );

    if (!document) {
      return false;
    }

    assertDepartmentAccess(
      user,
      document.department_id,
    );

    return true;
  }

  async createRelation(
    req: Request,
    res: Response,
  ) {
    try {
      const user = (
        req as CreateRelationRequest
      ).user;

      const documentId =
        typeof req.body?.document_id === "string"
          ? req.body.document_id
          : "";

      if (
        !(await this.assertDocumentScope(
          user,
          documentId,
        ))
      ) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      const documentRelation =
        await this.service.createRelation({
          ...req.body,
          created_by: user.id,
        });

      return res.status(201).json({
        success: true,
        message:
          "Document relation created successfully",
        data: documentRelation,
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
        (error.message ===
          "Document cannot relate to itself" ||
          error.message ===
            "Document relation already exists")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error instanceof Error &&
        (error.message ===
          "Document not found" ||
          error.message ===
            "Related document not found")
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

  async removeRelation(
    req: Request<{
      documentId: string;
      relatedDocumentId: string;
    }>,
    res: Response,
  ) {
    try {
      const user = (
        req as Request<{
          documentId: string;
          relatedDocumentId: string;
        }> & { user: SessionUser }
      ).user;

      if (
        !(await this.assertDocumentScope(
          user,
          req.params.documentId,
        ))
      ) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      await this.service.removeRelation({
        document_id:
          req.params.documentId,
        related_document_id:
          req.params.relatedDocumentId,
      });

      return res.json({
        success: true,
        message:
          "Document relation removed successfully",
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
          "Document relation not found"
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
