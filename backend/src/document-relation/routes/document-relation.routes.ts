import { Router } from "express";

import { DocumentRelationController } from "../controllers/document-relation.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller =
  new DocumentRelationController();

router.post(
  "/",
  authenticate,
  authorize("document_relation", "create"),
  controller.createRelation.bind(controller),
);

export default router;
