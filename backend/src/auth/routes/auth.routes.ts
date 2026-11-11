import { Router } from "express";

import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";

const router = Router();
const controller = new AuthController();

router.post("/login", controller.login.bind(controller));
router.get("/me", authenticate, controller.me.bind(controller));

router.get(
  "/permission-test",
  authenticate,
  authorize("user", "view"),
  (req, res) => {
    return res.json({
      message: "Permission Granted",
    });
  },
);

export default router;
