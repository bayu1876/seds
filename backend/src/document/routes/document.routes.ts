import { Router } from "express";

import { DocumentController } from "../controllers/document.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller =
  new DocumentController();

router.get(
  "/",
  authenticate,
  authorize("document", "view"),
  controller.findAll.bind(controller),
);

router.get(
  "/:id",
  authenticate,
  authorize("document", "view"),
  controller.findById.bind(controller),
);

router.post(
  "/",
  authenticate,
  authorize("document", "upload"),
  controller.create.bind(controller),
);

router.put(
  "/:id",
  authenticate,
  authorize("document", "update"),
  controller.update.bind(controller),
);

router.delete(
  "/:id",
  authenticate,
  controller.softDelete.bind(controller),
);
export default router;
