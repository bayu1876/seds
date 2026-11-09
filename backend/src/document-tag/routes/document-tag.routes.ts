import { Router } from "express";

import { DocumentTagController } from "../controllers/document-tag.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller =
  new DocumentTagController();

router.post(
  "/",
  authenticate,
  authorize("document_tag", "create"),
  controller.assignTag.bind(controller),
);

export default router;
