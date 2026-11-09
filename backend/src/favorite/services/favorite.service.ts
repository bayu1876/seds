import { FavoriteRepository } from "../repositories/favorite.repository.js";

type ToggleFavoriteInput = {
  user_id: string;
  document_id: string;
};

export class FavoriteService {
  private repository =
    new FavoriteRepository();

  async toggleFavorite(
    input: ToggleFavoriteInput,
  ) {
    const existing =
      await this.repository.findByUserAndDocument(
        input.user_id,
        input.document_id,
      );

    if (existing) {
      await this.repository.delete(
        input.user_id,
        input.document_id,
      );

      return {
        isFavorite: false,
        message: "Removed from favorites",
      };
    }

    await this.repository.create(input);

    return {
      isFavorite: true,
      message: "Added to favorites",
    };
  }

  async getFavorites(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const favorites =
      await this.repository.findByUser(userId);

    const total = favorites.length;

    const start = (page - 1) * limit;
    const end = start + limit;

    const data = favorites.slice(start, end);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }
}