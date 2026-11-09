import type {
  Request,
  Response,
} from "express";

import type { ParamsDictionary } from "express-serve-static-core";
import { DocumentVersionService } from "../services/document-version.service.js";

export interface UploadParams
  extends ParamsDictionary {
  documentId: string;
}

export interface DownloadParams
  extends ParamsDictionary {
  versionId: string;
}

type UploadRequest =
  Request<UploadParams> & {
    file?: Express.Multer.File;
    user: {
      id: string;
    };
  };

export class DocumentVersionController {
  private service =
    new DocumentVersionService();

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
