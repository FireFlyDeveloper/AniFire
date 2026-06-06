import AnilistModel from "../../models/meta/Anilist/Anilist.model";
import { MediaItemCategory, SearchResult } from "../../types/meta/anilist";

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

  async getSearchResults(
    search: string,
    type: "ANIME" | "MANGA",
    page: number = 1,
    perPage: number = 20
  ): Promise<SearchResult> {
    return await AnilistModel.fetchSearch(search, type, page, perPage);
  }

  async getMediaById(id: number): Promise<MediaItem> {
    return await AnilistModel.fetchMediaById(id);
  }
}

export default new AnilistService();
