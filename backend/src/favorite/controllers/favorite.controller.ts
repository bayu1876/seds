import type { Request, Response } from "express";

import { FavoriteService } from "../services/favorite.service.js";

type ToggleFavoriteRequest = Request & {
  user: {
    id: string;
  };
};

export class FavoriteController {
  private service =
    new FavoriteService();

  async toggleFavorite(
    req: Request,
    res: Response,
  ) {
    try {
      const user = (req as ToggleFavoriteRequest).user;

      const result =
        await this.service.toggleFavorite({
          user_id: user.id,
          document_id: req.body.document_id,
        });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          isFavorite: result.isFavorite,
        },
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

  async getFavorites(
    req: Request,
    res: Response,
  ) {
    try {
      const user = (req as ToggleFavoriteRequest).user;

      const result =
        await this.service.getFavorites(
          user.id,
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        );

      return res.status(200).json({
        success: true,
        message: "Favorites retrieved successfully",
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