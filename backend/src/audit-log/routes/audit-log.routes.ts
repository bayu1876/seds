import { Router } from "express";

import { AuditLogController } from "../controllers/audit-log.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller =
  new AuditLogController();

router.post(
  "/",
  authenticate,
  authorize("audit", "create"),
  controller.logAction.bind(controller),
);

router.get(
  "/user",
  authenticate,
  authorize("audit", "view"),
  controller.getUserActions.bind(controller),
);

router.get(
  "/document/:documentId",
  authenticate,
  authorize("audit", "view"),
  controller.getDocumentActions.bind(controller),
);

export default router;