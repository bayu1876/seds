import { Router } from "express";

import { UserController } from "../controllers/user.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = Router();
const controller = new UserController();

router.get(
  "/",
  authenticate,
  authorize("user", "view"),
  controller.findAll.bind(controller),
);

router.get("/me", authenticate, controller.getMyProfile.bind(controller));
router.get("/me/avatar", authenticate, controller.getMyAvatar.bind(controller));

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

router.post(
  "/me/avatar",
  authenticate,
  upload.single("file"),
  controller.uploadMyAvatar.bind(controller),
);

router.put("/me", authenticate, controller.updateMyProfile.bind(controller));

router.put(
  "/me/change-password",
  authenticate,
  controller.changeMyPassword.bind(controller),
);

router.put(
  "/:id",
  authenticate,
  authorize("user", "update"),
  controller.update.bind(controller),
);

router.patch(
  "/:id/reset-password",
  authenticate,
  authorize("user", "update"),
  controller.resetPassword.bind(controller),
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("user", "update"),
  controller.updateStatus.bind(controller),
);

router.delete(
  "/:id",
  authenticate,
  authorize("user", "delete"),
  controller.softDelete.bind(controller),
);

export default router;
