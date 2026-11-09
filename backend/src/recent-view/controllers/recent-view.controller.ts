import type { Request, Response } from "express";

import { RecentViewService } from "../services/recent-view.service.js";

type LogViewRequest = Request & {
  user: {
    id: string;
  };
};

export class RecentViewController {
  private service =
    new RecentViewService();

  async logView(
    req: Request,
    res: Response,
  ) {
    try {
      const user = (req as LogViewRequest).user;

      await this.service.logView(user.id, req.body.document_id);

      return res.status(201).json({
        success: true,
        message: "View logged successfully",
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

  async getRecentViews(
    req: Request,
    res: Response,
  ) {
    try {
      const user = (req as LogViewRequest).user;

      const result =
        await this.service.getRecentViews(
          user.id,
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        );

      return res.status(200).json({
        success: true,
        message: "Recent views retrieved successfully",
        data: result.data,
        meta: result.meta,
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