import type { Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";

import { AuthService } from "../../auth/services/auth.service.js";
import { UserService } from "../services/user.service.js";

type AuthedRequest = Request & {
  user: Awaited<ReturnType<AuthService["getCurrentUser"]>>;
  file?: Express.Multer.File;
};

export class UserController {
  private service = new UserService();

  async findAll(req: Request, res: Response) {
    try {
      const users = await this.service.findAll();

      return res.json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }

      const user = await this.service.findById(id);

      return res.json({
        success: true,
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const result = await this.service.createUser(req.body);

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: result,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "Username already exists" ||
          error.message === "Email already exists" ||
          error.message === "Employee number already exists" ||
          error.message === "Password is required")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }

      const result = await this.service.updateUser({
        ...req.body,
        id,
      });

      return res.json({
        success: true,
        message: "User updated successfully",
        data: result,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "Email already exists" ||
          error.message === "Employee number already exists")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error instanceof Error && error.message === "User not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }

      const result = await this.service.resetPassword({
        ...req.body,
        id,
      });

      return res.json({
        success: true,
        message: "Password reset successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Password is required") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }

      const user = (req as AuthedRequest).user;

      const result = await this.service.updateStatus({
        ...req.body,
        id,
        current_user_id: user.id,
        updated_by: user.id,
      });

      return res.json({
        success: true,
        message: "User status updated successfully",
        data: result,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "You cannot deactivate your own account"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async softDelete(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }

      const user = (req as AuthedRequest).user;

      const result = await this.service.softDelete({
        id,
        current_user_id: user.id,
        deleted_by: user.id,
      });

      return res.json({
        success: true,
        message: "User deleted successfully",
        data: result,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "You cannot delete your own account"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async updateMyProfile(req: Request, res: Response) {
    try {
      const user = (req as AuthedRequest).user;

      const result = await this.service.updateMyProfile({
        ...req.body,
        user_id: user.id,
      });

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Email already exists") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async getMyProfile(req: Request, res: Response) {
    try {
      const user = (req as AuthedRequest).user;

      const result = await this.service.getMyProfile(user.id);

      return res.json({
        success: true,
        message: "Profile retrieved successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async changeMyPassword(req: Request, res: Response) {
    try {
      const user = (req as AuthedRequest).user;

      await this.service.changeMyPassword({
        ...req.body,
        user_id: user.id,
      });

      return res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "Current password is incorrect" ||
          error.message === "Password confirmation does not match")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async uploadMyAvatar(req: Request, res: Response) {
    try {
      const authed = req as AuthedRequest;
      const file = authed.file;
      if (!file) {
        return res.status(400).json({ success: false, message: "File is required" });
      }

      const mime = file.mimetype || "";
      if (!mime.startsWith("image/")) {
        await fs.promises.unlink(file.path).catch(() => undefined);
        return res.status(400).json({ success: false, message: "Avatar must be an image file" });
      }

      const storageRoot = path.resolve("/srv/seds/storage");
      const avatarsDir = path.join(storageRoot, "avatars");
      await fs.promises.mkdir(avatarsDir, { recursive: true });

      const ext = path.extname(file.originalname || "").toLowerCase() || (mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : mime === "image/gif" ? ".gif" : ".jpg");
      const filename = `${authed.user.id}-${Date.now()}${ext}`;
      const destinationPath = path.join(avatarsDir, filename);
      const relativePath = path.posix.join("avatars", filename);

      await fs.promises.rename(file.path, destinationPath);

      // best-effort cleanup of previous avatar file if stored locally
      try {
        const existing = await this.service.getMyAvatar(authed.user.id);
        if (existing && existing.startsWith("avatars/")) {
          const oldPath = path.resolve(storageRoot, existing);
          if (oldPath.startsWith(avatarsDir + path.sep) && oldPath !== destinationPath) {
            await fs.promises.unlink(oldPath).catch(() => undefined);
          }
        }
      } catch {}

      const result = await this.service.updateMyAvatar(authed.user.id, relativePath);

      return res.json({
        success: true,
        message: "Avatar updated successfully",
        data: result,
      });
    } catch (error) {
      const file = (req as AuthedRequest).file;
      if (file?.path) {
        await fs.promises.unlink(file.path).catch(() => undefined);
      }
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  async getMyAvatar(req: Request, res: Response) {
    try {
      const authed = req as AuthedRequest;
      const avatarPath = await this.service.getMyAvatar(authed.user.id);
      if (!avatarPath) {
        return res.status(404).json({ success: false, message: "Avatar not found" });
      }

      const storageRoot = path.resolve("/srv/seds/storage");
      const filePath = path.resolve(storageRoot, avatarPath);
      if (!filePath.startsWith(storageRoot + path.sep)) {
        return res.status(404).json({ success: false, message: "Avatar not found" });
      }

      try {
        await fs.promises.access(filePath, fs.constants.R_OK);
      } catch {
        return res.status(404).json({ success: false, message: "Avatar not found" });
      }

      return res.sendFile(filePath);
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }
}
