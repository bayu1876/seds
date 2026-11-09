import { Router } from "express";

import { DashboardController } from "./dashboard.controller.js";
import {
  authenticate,
  authorize,
} from "../auth/middleware/auth.middleware.js";

const router = Router();
const controller = new DashboardController();

router.get(
  "/",
  authenticate,
  authorize("document", "view"),
  controller.getDashboard.bind(controller),
);

router.get(
  "/featured",
  authenticate,
  authorize("document", "view"),
  controller.getFeatured.bind(controller),
);

router.get(
  "/recently-published",
  authenticate,
  authorize("document", "view"),
  controller.getRecentlyPublished.bind(controller),
);

router.get(
  "/favorites",
  authenticate,
  authorize("document", "view"),
  controller.getFavorites.bind(controller),
);

router.get(
  "/recently-opened",
  authenticate,
  authorize("document", "view"),
  controller.getRecentlyOpened.bind(controller),
);

export default router;
