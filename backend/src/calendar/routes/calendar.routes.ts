import { Router } from "express";
import { CalendarController } from "../controllers/calendar.controller.js";
import { authenticate, authorize } from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller = new CalendarController();

router.get("/", authenticate, authorize("calendar", "view"), controller.findAll.bind(controller));
router.get("/:id", authenticate, authorize("calendar", "view"), controller.findById.bind(controller));
router.post("/", authenticate, authorize("calendar", "create"), controller.create.bind(controller));
router.put("/:id", authenticate, authorize("calendar", "update"), controller.update.bind(controller));
router.delete("/:id", authenticate, authorize("calendar", "delete"), controller.softDelete.bind(controller));

export default router;
