import type { Request, Response } from "express";

import { TagService } from "../services/tag.service.js";
import { AuthService } from "../../auth/services/auth.service.js";

export class TagController {
  private service =
    new TagService();

  async findAll(
    _req: Request,
    res: Response,
  ) {
    try {
      const tags =
        await this.service.findAll();

      return res.json({
        success: true,
        message:
          "Tags retrieved successfully",
        data: tags,
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
      const tag =
        await this.service.findById(
          req.params.id,
        );

      return res.json({
        success: true,
        message:
          "Tag retrieved successfully",
        data: tag,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Tag not found"
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

      const tag =
        await this.service.create({
          ...req.body,
          created_by: user.id,
        });

      return res.status(201).json({
        success: true,
        message:
          "Tag created successfully",
        data: tag,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Tag name already exists"
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

      const tag =
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
          "Tag updated successfully",
        data: tag,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (
          error.message ===
            "Tag not found" ||
          error.message ===
            "Tag name already exists"
        )
      ) {
        return res.status(
          error.message ===
            "Tag not found"
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
          "Tag deleted successfully",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Tag not found"
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
