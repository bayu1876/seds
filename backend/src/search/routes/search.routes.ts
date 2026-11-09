import { Router } from "express";

import { SearchController } from "../controllers/search.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller =
  new SearchController();

router.get(
  "/documents",
  authenticate,
  authorize("document", "view"),
  controller.searchDocuments.bind(controller),
);

export default router;
