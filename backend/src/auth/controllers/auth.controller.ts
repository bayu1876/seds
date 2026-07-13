import type { Request, Response } from "express";

import { AuthService } from "../services/auth.service.js";

export class AuthController {
  private service = new AuthService();

  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const result = await this.service.login(username, password);

      return res.json(result);
    } catch {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }
  }
}
