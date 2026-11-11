import { Router } from "express";
import { AnnouncementController } from "../controllers/announcement.controller.js";
import { authenticate, authorize } from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller = new AnnouncementController();

router.get("/active", authenticate, controller.findActive.bind(controller));

router.get("/", authenticate, authorize("announcement", "view"), controller.findAll.bind(controller));
router.get("/:id", authenticate, authorize("announcement", "view"), controller.findById.bind(controller));
router.post("/", authenticate, authorize("announcement", "create"), controller.create.bind(controller));
router.put("/:id", authenticate, authorize("announcement", "update"), controller.update.bind(controller));
router.delete("/:id", authenticate, authorize("announcement", "delete"), controller.softDelete.bind(controller));

export default router;
