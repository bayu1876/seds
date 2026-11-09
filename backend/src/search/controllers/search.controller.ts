import type {
  Request,
  Response,
} from "express";

import { SearchService } from "../services/search.service.js";

type SearchDocumentsQuery = {
  q?: string;
  department_id?: string;
  category_id?: string;
  confidential_level_id?: string;
  is_active?: string;
  page?: string;
  limit?: string;
};

export class SearchController {
  private service =
    new SearchService();

  async searchDocuments(
    req: Request,
    res: Response,
  ) {
    try {
      const result =
        await this.service.searchDocuments(
          req.query as SearchDocumentsQuery,
        );

      return res.status(200).json({
        success: true,
        message:
          "Documents retrieved successfully",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith(
          "Invalid ",
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

  async searchFulltext(
    req: Request,
    res: Response,
  ) {
    try {
      const result =
        await this.service.searchFulltext(
          req.query as SearchDocumentsQuery,
        );

      return res.status(200).json({
        success: true,
        message:
          "Documents retrieved successfully",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.startsWith(
          "Invalid ",
        ) ||
          error.message ===
            "q is required")
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
}
