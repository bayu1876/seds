import type { Request, Response } from "express";
import { AnnouncementService } from "../services/announcement.service.js";
import { AuthService } from "../../auth/services/auth.service.js";

type AuthedRequest = Request & {
  user: Awaited<ReturnType<AuthService["getCurrentUser"]>>;
};

export class AnnouncementController {
  private service = new AnnouncementService();

  async findAll(_req: Request, res: Response) {
    try {
      const data = await this.service.findAll();
      return res.json({ success: true, message: "Announcements retrieved successfully", data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Internal Server Error" });
    }
  }

  async findActive(_req: Request, res: Response) {
    try {
      const data = await this.service.findActive();
      return res.json({ success: true, message: "Active announcements retrieved successfully", data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Internal Server Error" });
    }
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    try {
      const data = await this.service.findById(req.params.id);
      return res.json({ success: true, message: "Announcement retrieved successfully", data });
    } catch (error) {
      if (error instanceof Error && error.message === "Announcement not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Internal Server Error" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = (req as AuthedRequest).user;
      const data = await this.service.create({ ...req.body, created_by: user.id });
      return res.status(201).json({ success: true, message: "Announcement created successfully", data });
    } catch (error) {
      if (error instanceof Error && (error.message === "Content is required" || error.message === "Invalid date format" || error.message === "End date must be after start date")) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Internal Server Error" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = (req as AuthedRequest).user;
      const data = await this.service.update(req.params.id as string, { ...req.body, updated_by: user.id });
      return res.json({ success: true, message: "Announcement updated successfully", data });
    } catch (error) {
      if (error instanceof Error && (error.message === "Announcement not found" || error.message === "Content is required" || error.message === "Invalid date format" || error.message === "End date must be after start date")) {
        return res.status(error.message === "Announcement not found" ? 404 : 400).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Internal Server Error" });
    }
  }

  async softDelete(req: Request, res: Response) {
    try {
      const user = (req as AuthedRequest).user;
      await this.service.softDelete(req.params.id as string, { deleted_by: user.id });
      return res.json({ success: true, message: "Announcement deleted successfully" });
    } catch (error) {
      if (error instanceof Error && error.message === "Announcement not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Internal Server Error" });
    }
  }
}
