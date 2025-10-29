import AnilistModel from "../../models/meta/AnilistModel";
import { MediaItemCategory } from "../../types/meta/anilist";

class AnilistService {
  async getHomeFeed(): Promise<MediaItemCategory[]> {
    const { anime, manga, manhwa, novels } = await AnilistModel.fetchHomeFeed();

    const combined = [
      ...anime.map((m) => ({ ...m, category: "Anime" })),
      ...manga.map((m) => ({ ...m, category: "Manga" })),
      ...manhwa.map((m) => ({ ...m, category: "Manhwa" })),
      ...novels.map((m) => ({ ...m, category: "Novel" })),
    ];

    combined.sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0));

    return combined;
  }
}

export default new AnilistService();
