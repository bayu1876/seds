import type {
  Request,
  Response,
} from "express";

import { DocumentService } from "../services/document.service.js";
import { AuthService } from "../../auth/services/auth.service.js";

export class DocumentController {
  private service =
    new DocumentService();

  async findAll(
    _req: Request,
    res: Response,
  ) {
    try {
      const documents =
        await this.service.findAll();

      return res.json({
        success: true,
        message:
          "Documents retrieved successfully",
        data: documents,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
    }
  }

  async findById(
    req: Request,
    res: Response,
  ) {
    try {
      const document =
        await this.service.findById(
          req.params.id as string,
        );

      return res.json({
        success: true,
        message:
          "Document retrieved successfully",
        data: document,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Document not found"
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

  async create(
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

      const document =
        await this.service.create({
          ...req.body,
          created_by: user.id,
        });

      return res.status(201).json({
        success: true,
        message:
          "Document created successfully",
        data: document,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Document number already exists"
      ) {
        return res.status(400).json({
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

  async update(
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

      const document =
        await this.service.update(
          req.params.id as string,
          {
            ...req.body,
            updated_by: user.id,
          },
        );

      return res.json({
        success: true,
        message:
          "Document updated successfully",
        data: document,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (
          error.message ===
            "Document not found" ||
          error.message ===
            "Document number already exists"
        )
      ) {
        return res.status(
          error.message ===
            "Document not found"
            ? 404
            : 400,
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

  async softDelete(
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

      const documentId = req.params.id as string;
      const document = await this.service.findById(documentId);

      const hasDeletePermission = user.userRoles.some((userRole) =>
        userRole.role.rolePermissions.some(
          (rolePermission) =>
            rolePermission.permission.module === "document" &&
            rolePermission.permission.action === "delete",
        ),
      );
      const isOwner = document.created_by === user.id;

      if (!hasDeletePermission && !isOwner) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      await this.service.softDelete(
        documentId,
        {
          deleted_by: user.id,
        },
      );

      return res.json({
        success: true,
        message:
          "Document deleted successfully",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Document not found"
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
