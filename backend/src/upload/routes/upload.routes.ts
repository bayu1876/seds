import { Router } from "express";

import { UploadController } from "../controllers/upload.controller.js";
import { upload } from "../../middleware/upload.middleware.js";
import {
  authenticate,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller =
  new UploadController();

router.post(
  "/test",
  authenticate,
  upload.single("file"),
  controller.test.bind(controller),
);

export default router;
