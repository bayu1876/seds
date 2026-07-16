import type { Request, Response } from "express";

import { RoleService } from "../services/role.service.js";

export class RoleController {
  private service = new RoleService();

  async findAll(
    _req: Request,
    res: Response,
  ) {
    try {
      const roles =
        await this.service.findAll();

      return res.json({
        success: true,
        message: "Roles retrieved successfully",
        data: roles,
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
      const role =
        await this.service.findById(
          req.params.id,
        );

      return res.json({
        success: true,
        message: "Role retrieved successfully",
        data: role,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Role not found"
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
