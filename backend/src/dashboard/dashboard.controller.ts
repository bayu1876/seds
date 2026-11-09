import type { Request, Response } from "express";

import { DashboardService } from "./dashboard.service.js";

type DashboardRequest = Request & {
  user: {
    id: string;
  };
};

export class DashboardController {
  private service = new DashboardService();

  async getDashboard(req: Request, res: Response) {
    try {
      const user = (req as DashboardRequest).user;

      const result = await this.service.getDashboardData(user.id);

      return res.status(200).json({
        success: true,
        message: "Dashboard data retrieved successfully",
        data: result,
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

  async getFeatured(req: Request, res: Response) {
    try {
      const user = (req as DashboardRequest).user;

      const result = await this.service.getFeaturedKnowledge(user.id);

      return res.status(200).json({
        success: true,
        message: "Featured knowledge retrieved successfully",
        data: result,
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

  async getRecentlyPublished(req: Request, res: Response) {
    try {
      const user = (req as DashboardRequest).user;

      const result = await this.service.getRecentlyPublished(user.id);

      return res.status(200).json({
        success: true,
        message: "Recently published retrieved successfully",
        data: result,
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

  async getFavorites(req: Request, res: Response) {
    try {
      const user = (req as DashboardRequest).user;

      const result = await this.service.getMyFavorites(user.id);

      return res.status(200).json({
        success: true,
        message: "My favorites retrieved successfully",
        data: result,
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

  async getRecentlyOpened(req: Request, res: Response) {
    try {
      const user = (req as DashboardRequest).user;

      const result = await this.service.getRecentlyOpened(user.id);

      return res.status(200).json({
        success: true,
        message: "Recently opened retrieved successfully",
        data: result,
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
}
