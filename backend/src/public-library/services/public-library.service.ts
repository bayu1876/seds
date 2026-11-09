import { PublicLibraryRepository } from "../repositories/public-library.repository.js";

export type PublicationDTO = {
  id: string;
  document_id: string;
  document_number: string | null;
  title: string;
  description: string | null;
  department_name: string | null;
  category_name: string | null;
  is_published: boolean;
  featured: boolean;
  display_order: number;
  published_at: Date | null;
};

export class PublicLibraryService {
  private repository = new PublicLibraryRepository();

  async getPublished(): Promise<PublicationDTO[]> {
    return this.repository.findPublished();
  }

  async getById(id: string): Promise<PublicationDTO | null> {
    return this.repository.findById(id);
  }
}
