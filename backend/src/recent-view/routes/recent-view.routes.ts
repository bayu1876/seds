import { Router } from "express";

import { RecentViewController } from "../controllers/recent-view.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller =
  new RecentViewController();

router.post(
  "/",
  authenticate,
  authorize("document", "view"),
  controller.logView.bind(controller),
);

router.get(
  "/",
  authenticate,
  authorize("document", "view"),
  controller.getRecentViews.bind(controller),
);

export default router;