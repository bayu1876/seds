import { Router } from "express";

import { CategoryController } from "../controllers/category.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller =
  new CategoryController();

router.get(
  "/",
  authenticate,
  authorize("category", "view"),
  controller.findAll.bind(controller),
);

router.get(
  "/:id",
  authenticate,
  authorize("category", "view"),
  controller.findById.bind(controller),
);

router.post(
  "/",
  authenticate,
  authorize("category", "create"),
  controller.create.bind(controller),
);

router.put(
  "/:id",
  authenticate,
  authorize("category", "update"),
  controller.update.bind(controller),
);

router.delete(
  "/:id",
  authenticate,
  authorize("category", "delete"),
  controller.softDelete.bind(controller),
);

export default router;
