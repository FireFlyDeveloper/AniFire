import MetaModel from "..";
import { HomeFeed, MediaItem, SearchResult, PageInfo } from "../../../types/meta/anilist";
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

  async fetchSearch(
    search: string,
    type: "ANIME" | "MANGA",
    page: number = 1,
    perPage: number = 20
  ): Promise<SearchResult> {
    const body = JSON.stringify({
      query: ANILIST_QUERIES.SEARCH_MEDIA,
      variables: {
        search,
        type,
        page,
        perPage,
      },
    });

    const result = await this.request<{
      data: {
        Page: {
          pageInfo: PageInfo;
          media: MediaItem[];
        };
      };
    }>(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = result.data.Page;

    return {
      items: data.media,
      pageInfo: data.pageInfo,
    };
  }
}

export default new AnilistModel();
