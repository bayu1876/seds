import fs from "node:fs";
import type {
  Request,
  Response,
} from "express";

import type { ParamsDictionary } from "express-serve-static-core";
import type { SessionUser } from "../../auth/utils/access.js";
import {
  assertDepartmentAccess,
  DepartmentScopeError,
} from "../../auth/utils/department-scope.js";
import { DocumentRepository } from "../../document/repositories/document.repository.js";
import { DocumentVersionRepository } from "../repositories/document-version.repository.js";
import { DocumentVersionService } from "../services/document-version.service.js";

export interface UploadParams
  extends ParamsDictionary {
  documentId: string;
}

export interface DownloadParams
  extends ParamsDictionary {
  versionId: string;
}

export interface SetCurrentParams
  extends ParamsDictionary {
  versionId: string;
}

type UploadRequest =
  Request<UploadParams> & {
    file?: Express.Multer.File;
    user: SessionUser;
  };

export class DocumentVersionController {
  private service =
    new DocumentVersionService();

  private versionRepository =
    new DocumentVersionRepository();

  private documentRepository =
    new DocumentRepository();

  async setCurrent(
    req: Request<SetCurrentParams>,
    res: Response,
  ) {
    try {
      const user = (
        req as Request<SetCurrentParams> & {
          user: SessionUser;
        }
      ).user;

      const version =
        await this.versionRepository.findById(
          req.params.versionId,
        );

      if (!version || version.document.deleted_at) {
        return res.status(404).json({
          success: false,
          message:
            "Document version not found",
        });
      }

      assertDepartmentAccess(
        user,
        version.document.department_id,
      );

      const updated =
        await this.service.setCurrent(
          req.params.versionId,
        );

      return res.status(200).json({
        success: true,
        message:
          "Current version updated successfully",
        data: updated,
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
          "Document version not found"
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
            : "Failed to update current version",
      });
    }
  }

  async download(
    req: Request<DownloadParams>,
    res: Response,
  ) {
    try {
      const file =
        await this.service.download(
          req.params.versionId,
        );

      res.setHeader(
        "Content-Type",
        file.mimeType ||
          "application/octet-stream",
      );

      return res.download(
        file.filePath,
        file.fileName,
        (error) => {
          if (
            error &&
            !res.headersSent
          ) {
            res.status(500).json({
              success: false,
              message: "Download failed",
            });
          }
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message ===
          "Document version not found" ||
          error.message ===
            "File not found")
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
            : "Download failed",
      });
    }
  }

  async thumbnail(
    req: Request<DownloadParams>,
    res: Response,
  ) {
    try {
      const file = await this.service.thumbnail(req.params.versionId);
      res.setHeader("Content-Type", file.mimeType || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.sendFile(file.filePath);
    } catch (error) {
      if (error instanceof Error && (error.message === "Document version not found" || error.message === "Thumbnail not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to load thumbnail",
      });
    }
  }

  async findHistory(
    req: Request<UploadParams>,
    res: Response,
  ) {
    try {
      const versions =
        await this.service.findHistory(
          req.params.documentId,
        );

      return res.status(200).json({
        success: true,
        message:
          "Document version history retrieved successfully",
        data: versions,
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
            : "Failed to retrieve version history",
      });
    }
  }

  async upload(
    req: Request<UploadParams>,
    res: Response,
  ) {
    try {
      const uploadReq =
        req as UploadRequest;

      const file = uploadReq.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "File is required",
        });
      }

      const document =
        await this.documentRepository.findById(
          req.params.documentId,
        );

      if (!document) {
        await fs.promises
          .unlink(file.path)
          .catch(() => undefined);

        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      try {
        assertDepartmentAccess(
          uploadReq.user,
          document.department_id,
        );
      } catch (error) {
        await fs.promises
          .unlink(file.path)
          .catch(() => undefined);

        if (error instanceof DepartmentScopeError) {
          return res.status(403).json({
            success: false,
            message: error.message,
          });
        }

        throw error;
      }

      const documentVersion =
        await this.service.upload({
          documentId:
            req.params.documentId,
          uploadedBy:
            uploadReq.user.id,
          tempPath: file.path,
          originalFilename:
            file.originalname,
          storedFilename:
            file.filename,
          mimeType:
            file.mimetype,
          fileSize:
            file.size,
          versionNotes:
            req.body?.version_notes ??
            null,
        });

      return res.status(201).json({
        success: true,
        message:
          "Document version uploaded successfully",
        data: documentVersion,
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

      if (
        error instanceof Error &&
        error.message ===
          "Version conflict, please retry"
      ) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Upload failed",
      });
    }
  }
}
