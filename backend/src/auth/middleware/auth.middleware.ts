import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { AuthService } from "../services/auth.service.js";
import {
  BASE_PERMISSION_SET,
  isSuperAdmin,
} from "../utils/access.js";

const authService = new AuthService();

type AuthedUser = Awaited<ReturnType<AuthService["getCurrentUser"]>>;

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const token = authHeader.substring(7);

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      username: string;
    };

    const user = await authService.getCurrentUser(payload.userId);

    (req as Request & { user: typeof user }).user = user;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

export function authorize(module: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user: AuthedUser }).user;

    if (isSuperAdmin(user)) {
      return next();
    }

    if (BASE_PERMISSION_SET.has(`${module}:${action}`)) {
      return next();
    }

    const allowed = user.userRoles.some((userRole) =>
      userRole.role.rolePermissions.some(
        (rolePermission) =>
          rolePermission.permission.module === module &&
          rolePermission.permission.action === action &&
          rolePermission.permission.is_active !== false,
      ),
    );

    if (!allowed) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    next();
  };
}
