import MetaModel from "..";
import { HomeFeed, MediaItem } from "../../../types/meta/anilist";
import { ANILIST_QUERIES } from "./anilist.queries";

class AnilistModel extends MetaModel {
  url = "https://graphql.anilist.co";
  name = "Anilist";

  async fetchHomeFeed(): Promise<HomeFeed> {
    const body = JSON.stringify({ query: ANILIST_QUERIES.HOME_FEED });

    const result = await this.request<{
      data: {
        trendingAnime: { media: MediaItem[] };
        popularManga: { media: MediaItem[] };
        manhwa: { media: MediaItem[] };
        lightNovels: { media: MediaItem[] };
      };
    }>(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = result.data;

    return {
      anime: data.trendingAnime.media,
      manga: data.popularManga.media,
      manhwa: data.manhwa.media,
      novels: data.lightNovels.media,
    };
  }
}

export default new AnilistModel();
