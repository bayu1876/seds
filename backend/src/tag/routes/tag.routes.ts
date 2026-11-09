import { Router } from "express";

import { TagController } from "../controllers/tag.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller =
  new TagController();

router.get(
  "/",
  authenticate,
  authorize("tag", "view"),
  controller.findAll.bind(controller),
);

router.get(
  "/:id",
  authenticate,
  authorize("tag", "view"),
  controller.findById.bind(controller),
);

router.post(
  "/",
  authenticate,
  authorize("tag", "create"),
  controller.create.bind(controller),
);

router.put(
  "/:id",
  authenticate,
  authorize("tag", "update"),
  controller.update.bind(controller),
);

router.delete(
  "/:id",
  authenticate,
  authorize("tag", "delete"),
  controller.softDelete.bind(controller),
);
export default router;
