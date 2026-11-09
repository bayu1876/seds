import { Router } from "express";

import { FavoriteController } from "../controllers/favorite.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller =
  new FavoriteController();

router.post(
  "/",
  authenticate,
  authorize("document", "view"),
  controller.toggleFavorite.bind(controller),
);

router.get(
  "/",
  authenticate,
  authorize("document", "view"),
  controller.getFavorites.bind(controller),
);

export default router;