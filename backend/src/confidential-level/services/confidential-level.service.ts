import { ConfidentialLevelRepository } from "../repositories/confidential-level.repository.js";

export class ConfidentialLevelService {
  private repository =
    new ConfidentialLevelRepository();

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const level =
      await this.repository.findById(id);

    if (!level) {
      throw new Error(
        "Confidential level not found",
      );
    }

    return level;
  }
}
