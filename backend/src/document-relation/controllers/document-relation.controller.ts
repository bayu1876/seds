import type {
  Request,
  Response,
} from "express";

import { DocumentRelationService } from "../services/document-relation.service.js";

type CreateRelationRequest = Request & {
  user: {
    id: string;
  };
};

export class DocumentRelationController {
  private service =
    new DocumentRelationService();

  async createRelation(
    req: Request,
    res: Response,
  ) {
    try {
      const user = (
        req as CreateRelationRequest
      ).user;

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
