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
