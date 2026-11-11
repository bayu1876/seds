import type { Request, Response } from "express";
import type { SessionUser } from "../../auth/utils/access.js";
import {
  assertDepartmentAccess,
  DepartmentScopeError,
} from "../../auth/utils/department-scope.js";
import { DocumentRepository } from "../../document/repositories/document.repository.js";
import { PublicLibraryRepository } from "../repositories/public-library.repository.js";
import { PublicLibraryAdminService } from "../services/public-library-admin.service.js";

type PublishBody = {
  document_id: string;
  version_id: string;
  featured?: boolean;
  display_order?: number;
};

type UpdateBody = {
  is_published?: boolean;
  featured?: boolean;
  display_order?: number;
};

type AuthedRequest = Request & { user: SessionUser };

export class PublicLibraryAdminController {
  private service = new PublicLibraryAdminService();

  private repository = new PublicLibraryRepository();

  private documentRepository = new DocumentRepository();

  async getAll(req: Request, res: Response) {
    try {
      const result = await this.service.getAll();

      return res.status(200).json({
        success: true,
        message: "Public library publications retrieved successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async publish(req: Request, res: Response) {
    try {
      const user = (req as AuthedRequest).user;
      const body = req.body as PublishBody;

      if (!body.document_id || !body.version_id) {
        return res.status(400).json({
          success: false,
          message: "document_id and version_id are required",
        });
      }

      const document = await this.documentRepository.findById(
        body.document_id,
      );

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      assertDepartmentAccess(user, document.department_id);

      const result = await this.service.publishDocument(
        user.id,
        body.document_id,
        body.version_id,
        body.featured ?? false,
        body.display_order ?? 0,
      );

      return res.status(201).json({
        success: true,
        message: "Document published successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof DepartmentScopeError) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      const err = error instanceof Error ? error.message : "Internal Server Error";
      const status = err === "Document is already published" ? 409 : 500;
      return res.status(status).json({
        success: false,
        message: err,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = (req as AuthedRequest).user;
      const id = typeof req.params.id === "string" ? req.params.id : String(req.params.id);
      const body = req.body as UpdateBody;

      const publication = await this.repository.findById(id);

      if (!publication) {
        return res.status(404).json({
          success: false,
          message: "Publication not found",
        });
      }

      assertDepartmentAccess(user, publication.department_id);

      const result = await this.service.updatePublication(id, user.id, body);

      return res.status(200).json({
        success: true,
        message: "Publication updated successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof DepartmentScopeError) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async unpublish(req: Request, res: Response) {
    try {
      const user = (req as AuthedRequest).user;
      const id = typeof req.params.id === "string" ? req.params.id : String(req.params.id);

      const publication = await this.repository.findById(id);

      if (!publication) {
        return res.status(404).json({
          success: false,
          message: "Publication not found",
        });
      }

      assertDepartmentAccess(user, publication.department_id);

      await this.service.unpublishDocument(id, user.id);

      return res.status(200).json({
        success: true,
        message: "Document unpublished successfully",
      });
    } catch (error) {
      if (error instanceof DepartmentScopeError) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      const err = error instanceof Error ? error.message : "Internal Server Error";
      const status = err === "Publication not found" ? 404 : 500;
      return res.status(status).json({
        success: false,
        message: err,
      });
    }
  }

  async toggleFeatured(req: Request, res: Response) {
    try {
      const user = (req as AuthedRequest).user;
      const id = typeof req.params.id === "string" ? req.params.id : String(req.params.id);
      const { featured } = req.body;

      if (typeof featured !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "featured must be a boolean",
        });
      }

      const publication = await this.repository.findById(id);

      if (!publication) {
        return res.status(404).json({
          success: false,
          message: "Publication not found",
        });
      }

      assertDepartmentAccess(user, publication.department_id);

      const result = await this.service.toggleFeatured(id, user.id, featured);

      return res.status(200).json({
        success: true,
        message: `Document ${featured ? "featured" : "unfeatured"} successfully`,
        data: result,
      });
    } catch (error) {
      if (error instanceof DepartmentScopeError) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }
}
