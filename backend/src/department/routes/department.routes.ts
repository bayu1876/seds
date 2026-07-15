import { Router } from "express";

import { DepartmentController } from "../controllers/department.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller = new DepartmentController();

router.get(
  "/",
  authenticate,
  authorize("department", "view"),
  controller.findAll.bind(controller),
);

router.get(
  "/:id",
  authenticate,
  authorize("department", "view"),
  controller.findById.bind(controller),
);

router.post(
  "/",
  authenticate,
  authorize("department", "create"),
  controller.create.bind(controller),
);

router.put(
  "/:id",
  authenticate,
  authorize("department", "update"),
  controller.update.bind(controller),
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("department", "update"),
  controller.updateStatus.bind(controller),
);

router.delete(
  "/:id",
  authenticate,
  authorize("department", "delete"),
  controller.softDelete.bind(controller),
);
export default router;
