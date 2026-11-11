import { PublicLibraryRepository } from "../repositories/public-library.repository.js";
import type { PublicationItem } from "../repositories/public-library.repository.js";

export type PublicationDTO = PublicationItem;

export class PublicLibraryService {
  private repository = new PublicLibraryRepository();

  async getPublished(): Promise<PublicationDTO[]> {
    return this.repository.findPublished();
  }

  async getById(id: string): Promise<PublicationDTO | null> {
    return this.repository.findById(id);
  }
}
