import { Router } from "express";

import { RolePermissionController } from "../controllers/role-permission.controller.js";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware.js";

const router = Router();
const controller =
  new RolePermissionController();

router.get(
  "/roles/:roleId/permissions",
  authenticate,
  authorize("role_permission", "view"),
  controller.findByRoleId.bind(controller),
);

router.get(
  "/roles/:roleId/permission-matrix",
  authenticate,
  authorize("role_permission", "view"),
  controller.findAllPermissionsByRoleId.bind(
    controller,
  ),
);

router.post(
  "/roles/:roleId/permissions",
  authenticate,
  authorize("role_permission", "update"),
  controller.assignPermission.bind(
    controller,
  ),
);

router.delete(
  "/roles/:roleId/permissions",
  authenticate,
  authorize("role_permission", "update"),
  controller.unassignPermission.bind(
    controller,
  ),
);

export default router;
