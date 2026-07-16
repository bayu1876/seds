import type { Request, Response } from "express";

import { CategoryService } from "../services/category.service.js";
import { AuthService } from "../../auth/services/auth.service.js";

export class CategoryController {
  private service =
    new CategoryService();

  async findAll(
    _req: Request,
    res: Response,
  ) {
    try {
      const categories =
        await this.service.findAll();

      return res.json({
        success: true,
        message:
          "Categories retrieved successfully",
        data: categories,
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
      const category =
        await this.service.findById(
          req.params.id,
        );

      return res.json({
        success: true,
        message:
          "Category retrieved successfully",
        data: category,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Category not found"
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

      const category =
        await this.service.create({
          ...req.body,
          created_by: user.id,
        });

      return res.status(201).json({
        success: true,
        message:
          "Category created successfully",
        data: category,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Category code already exists"
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

      const category =
        await this.service.update(
          req.params.id as string,
          {
            ...req.body,
            updated_by: user.id,
          },
        );

      return res.json({
        success: true,
        message:
          "Category updated successfully",
        data: category,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (
          error.message ===
            "Category not found" ||
          error.message ===
            "Category code already exists"
        )
      ) {
        return res.status(
          error.message ===
            "Category not found"
            ? 404
            : 400,
        ).json({
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

      await this.service.softDelete(
        req.params.id as string,
        {
          deleted_by: user.id,
        },
      );

      return res.json({
        success: true,
        message:
          "Category deleted successfully",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Category not found"
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
