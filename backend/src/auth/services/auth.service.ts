import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { AuthRepository } from "../repositories/auth.repository.js";

export class AuthService {
  private repository = new AuthRepository();

  async login(username: string, password: string) {
    const user = await this.repository.findByUsername(username);

    if (!user) {
      throw new Error("Invalid username or password");
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!validPassword) {
      throw new Error("Invalid username or password");
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

    const { password_hash, ...safeUser } = user;

    return {
      token,
      user: safeUser,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.repository.findUserWithPermissions(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const { password_hash, ...safeUser } = user;

    return safeUser;
  }
}
