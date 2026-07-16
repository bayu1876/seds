import { Router } from "express";

import { PermissionController } from "../controllers/permission.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller = new PermissionController();

router.get(
  "/",
  authenticate,
  authorize("permission", "view"),
  controller.findAll.bind(controller),
);

router.get(
  "/:id",
  authenticate,
  authorize("permission", "view"),
  controller.findById.bind(controller),
);

export default router;
