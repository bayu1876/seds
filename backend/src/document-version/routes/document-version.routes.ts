import { Router, type Request } from "express";
import { upload } from "../../middleware/upload.middleware.js";
import { DocumentVersionController } from "../controllers/document-version.controller.js";
import type { UploadParams } from "../controllers/document-version.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();

const controller =
  new DocumentVersionController();

router.get(
  "/:documentId",
  authenticate,
  authorize( "document_version", "view" ),
  ( req, res ) =>
    controller.findHistory(
      req as Request<UploadParams>,
      res,
    ),
);

router.post(
  "/:documentId/upload",
  authenticate,
  authorize( "document_version", "upload" ),
  upload.single( "file" ),
  ( req, res ) =>
    controller.upload(
      req as Request<UploadParams>,
      res,
    ),
);
export default router;
