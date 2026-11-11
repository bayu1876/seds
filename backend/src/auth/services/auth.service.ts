import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { AuthRepository } from "../repositories/auth.repository.js";
import {
  buildAccess,
  toSafeUser,
  type SessionUser,
} from "../utils/access.js";

export class AuthService {
  private repository = new AuthRepository();

  async login(username: string, password: string) {
    const user = await this.repository.findByUsername(username);

    if (!user) {
      throw new Error("Invalid username or password");
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      throw new Error("Invalid username or password");
    }

    const sessionUser = await this.repository.findUserWithPermissions(user.id);

    if (!sessionUser) {
      throw new Error("User not found");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "8h",
      },
    );

    return {
      token,
      user: toSafeUser(sessionUser),
      access: buildAccess(sessionUser),
    };
  }

  async getCurrentUser(userId: string): Promise<SessionUser> {
    const user = await this.repository.findUserWithPermissions(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  getSession(sessionUser: SessionUser) {
    return {
      user: toSafeUser(sessionUser),
      access: buildAccess(sessionUser),
    };
  }
}
