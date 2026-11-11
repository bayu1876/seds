import type { Request, Response } from "express";

import { RolePermissionService } from "../services/role-permission.service.js";

export class RolePermissionController {
  private service =
    new RolePermissionService();

  async findByRoleId(
    req: Request<{ roleId: string }>,
    res: Response,
  ) {
    try {
      const permissions =
        await this.service.findByRoleId(
          req.params.roleId,
        );

      return res.json({
        success: true,
        message:
          "Role permissions retrieved successfully",
        data: permissions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
    }
  }

  async findAllPermissionsByRoleId(
    req: Request<{ roleId: string }>,
    res: Response,
  ) {
    try {
      const permissions =
        await this.service.findAllPermissionsByRoleId(
          req.params.roleId,
        );

      return res.json({
        success: true,
        message:
          "Role permission matrix retrieved successfully",
        data: permissions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
    }
  }

  async assignPermission(
    req: Request<
      { roleId: string },
      unknown,
      { permissionId: string }
    >,
    res: Response,
  ) {
    try {
      if (!req.body?.permissionId) {
        return res.status(400).json({
          success: false,
          message: "permissionId is required",
        });
      }

      await this.service.assignPermission({
        roleId: req.params.roleId,
        permissionId: req.body.permissionId,
      });

      return res.status(201).json({
        success: true,
        message:
          "Permission assigned successfully",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Internal Server Error";

      return res.status(
        message === "Role not found" ? 404 : 400,
      ).json({
        success: false,
        message,
      });
    }
  }

  async unassignPermission(
    req: Request<
      { roleId: string },
      unknown,
      { permissionId: string }
    >,
    res: Response,
  ) {
    try {
      if (!req.body?.permissionId) {
        return res.status(400).json({
          success: false,
          message: "permissionId is required",
        });
      }

      await this.service.unassignPermission({
        roleId: req.params.roleId,
        permissionId: req.body.permissionId,
      });

      return res.json({
        success: true,
        message:
          "Permission unassigned successfully",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Internal Server Error";

      return res.status(
        message === "Role not found" ? 404 : 400,
      ).json({
        success: false,
        message,
      });
    }
  }
}
