import { Router } from "express";

import { UserController } from "../controllers/user.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller = new UserController();

router.get(
  "/",
  authenticate,
  authorize("user", "view"),
  controller.findAll.bind(controller),
);

router.get(
  "/:id",
  authenticate,
  authorize("user", "view"),
  controller.findById.bind(controller),
);

router.post(
  "/",
  authenticate,
  authorize("user", "create"),
  controller.create.bind(controller),
);

export default router;
