import { Router } from "express";

import { ConfidentialLevelController } from "../controllers/confidential-level.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller =
  new ConfidentialLevelController();

router.get(
  "/",
  authenticate,
  authorize("confidential_level", "view"),
  controller.findAll.bind(controller),
);

router.get(
  "/:id",
  authenticate,
  authorize("confidential_level", "view"),
  controller.findById.bind(controller),
);

export default router;
