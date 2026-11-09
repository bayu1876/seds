import type { Request, Response } from "express";

import { ConfidentialLevelService } from "../services/confidential-level.service.js";

export class ConfidentialLevelController {
  private service =
    new ConfidentialLevelService();

  async findAll(
    _req: Request,
    res: Response,
  ) {
    try {
      const levels =
        await this.service.findAll();

      return res.json({
        success: true,
        message:
          "Confidential levels retrieved successfully",
        data: levels,
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
    req: Request,
    res: Response,
  ) {
    try {
      const level =
        await this.service.findById(
          req.params.id as string,
        );

      return res.json({
        success: true,
        message:
          "Confidential level retrieved successfully",
        data: level,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Confidential level not found"
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
