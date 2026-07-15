import type { Request, Response } from "express";

import { DepartmentService } from "../services/department.service.js";
import { AuthService } from "../../auth/services/auth.service.js";

export class DepartmentController {
  private service = new DepartmentService();

  async findAll(
    _req: Request,
    res: Response,
  ) {
    try {
      const departments =
        await this.service.findAll();

      return res.json({
        success: true,
        message: "Departments retrieved successfully",
        data: departments,
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
      const department =
        await this.service.findById(
          req.params.id,
        );

      return res.json({
        success: true,
        message: "Department retrieved successfully",
        data: department,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Department not found"
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

  async create(
    req: Request,
    res: Response,
  ) {
    try {
      const user = (
        req as Request & {
          user: Awaited<
            ReturnType<AuthService["getCurrentUser"]>
          >;
        }
      ).user;

      const department =
        await this.service.create({
          ...req.body,
          created_by: user.id,
        });

      return res.status(201).json({
        success: true,
        message: "Department created successfully",
        data: department,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Department code already exists"
      ) {
        return res.status(400).json({
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

  async update(
    req: Request<{ id: string }>,
    res: Response,
  ) {
    try {
      const user = (
        req as Request<{ id: string }> & {
          user: Awaited<
            ReturnType<AuthService["getCurrentUser"]>
          >;
        }
      ).user;

      const department =
        await this.service.update({
          id: req.params.id,
          ...req.body,
          updated_by: user.id,
        });

      return res.json({
        success: true,
        message: "Department updated successfully",
        data: department,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (
          error.message ===
            "Department not found" ||
          error.message ===
            "Department code already exists"
        )
      ) {
        return res.status(400).json({
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

  async updateStatus(
    req: Request<{ id: string }>,
    res: Response,
  ) {
    try {
      const user = (
        req as Request<{ id: string }> & {
          user: Awaited<
            ReturnType<AuthService["getCurrentUser"]>
          >;
        }
      ).user;

      const department =
        await this.service.updateStatus({
          id: req.params.id,
          is_active: req.body.is_active,
          updated_by: user.id,
        });

      return res.json({
        success: true,
        message: "Department status updated successfully",
        data: department,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Department not found"
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

  async softDelete(
    req: Request<{ id: string }>,
    res: Response,
  ) {
    try {
      const user = (
        req as Request<{ id: string }> & {
          user: Awaited<
            ReturnType<AuthService["getCurrentUser"]>
          >;
        }
      ).user;

      await this.service.softDelete({
        id: req.params.id,
        deleted_by: user.id,
      });

      return res.json({
        success: true,
        message: "Department deleted successfully",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Department not found"
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
