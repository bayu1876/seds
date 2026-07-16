import type { Request, Response } from "express";

import { PermissionService } from "../services/permission.service.js";

export class PermissionController {
  private service = new PermissionService();

  async findAll(
    _req: Request,
    res: Response,
  ) {
    try {
      const permissions =
        await this.service.findAll();

      return res.json({
        success: true,
        message: "Permissions retrieved successfully",
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

  async findById(
    req: Request<{ id: string }>,
    res: Response,
  ) {
    try {
      const permission =
        await this.service.findById(
          req.params.id,
        );

      return res.json({
        success: true,
        message: "Permission retrieved successfully",
        data: permission,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Permission not found"
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
    }
  }
}
