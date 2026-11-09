import type { Request, Response } from "express";
import { PublicLibraryService } from "../services/public-library.service.js";

export class PublicLibraryController {
  private service = new PublicLibraryService();

  async getPublished(req: Request, res: Response) {
    try {
      const result = await this.service.getPublished();

      return res.status(200).json({
        success: true,
        message: "Public library catalog retrieved successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : String(req.params.id);
      const result = await this.service.getById(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Document not found in public library",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Document retrieved successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }
}
