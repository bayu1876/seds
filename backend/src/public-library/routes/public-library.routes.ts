import { Router } from "express";

import { PublicLibraryController } from "../controllers/public-library.controller.js";
import { PublicLibraryAdminController } from "../controllers/public-library-admin.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller = new PublicLibraryController();
const adminController = new PublicLibraryAdminController();

// Admin routes must come before /:id to avoid route matching conflicts

// Admin: Get all publications
router.get(
  "/admin",
  authenticate,
  authorize("document", "view"),
  adminController.getAll.bind(adminController),
);

// Admin: Publish a document
router.post(
  "/admin",
  authenticate,
  authorize("document", "upload"),
  adminController.publish.bind(adminController),
);

// Admin: Update publication settings
router.patch(
  "/admin/:id",
  authenticate,
  authorize("document", "update"),
  adminController.update.bind(adminController),
);

// Admin: Unpublish a document
router.delete(
  "/admin/:id",
  authenticate,
  authorize("document", "delete"),
  adminController.unpublish.bind(adminController),
);

// Admin: Toggle featured status
router.patch(
  "/admin/:id/featured",
  authenticate,
  authorize("document", "update"),
  adminController.toggleFeatured.bind(adminController),
);

// Public: Get published documents from public library
router.get(
  "/",
  authenticate,
  authorize("document", "view"),
  controller.getPublished.bind(controller),
);

// Public: Get specific published document by ID
router.get(
  "/:id",
  authenticate,
  authorize("document", "view"),
  controller.getById.bind(controller),
);

export default router;
