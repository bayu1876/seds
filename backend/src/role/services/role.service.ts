import { RoleRepository } from "../repositories/role.repository.js";

export class RoleService {
  private repository = new RoleRepository();

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const role =
      await this.repository.findById(id);

    if (!role) {
      throw new Error("Role not found");
    }

    return role;
  }

}
