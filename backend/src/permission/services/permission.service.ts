import { PermissionRepository } from "../repositories/permission.repository.js";

export class PermissionService {
  private repository =
    new PermissionRepository();

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const permission =
      await this.repository.findById(id);

    if (!permission) {
      throw new Error(
        "Permission not found",
      );
    }

    return permission;
  }
}
