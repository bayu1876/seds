import type {
  Request,
  Response,
} from "express";

import { DocumentTagService } from "../services/document-tag.service.js";
import { AuthService } from "../../auth/services/auth.service.js";

export class DocumentTagController {
  private service =
    new DocumentTagService();

  async assignTag(
    req: Request,
    res: Response,
  ) {
    try {
      const user = (
        req as Request & {
          user: Awaited<
            ReturnType<AuthService["getCurrentUser"]>
          >;
        }
      ).user;

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
}
