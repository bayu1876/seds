import { Router } from "express";

import { RoleController } from "../controllers/role.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller = new RoleController();

router.get(
  "/",
  authenticate,
  authorize("role", "view"),
  controller.findAll.bind(controller),
);

router.get(
  "/:id",
  authenticate,
  authorize("role", "view"),
  controller.findById.bind(controller),
);


export default router;
