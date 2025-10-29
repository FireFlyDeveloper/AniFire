import MetaModel from ".";
import { HomeFeed, MediaItem } from "../../types/meta/anilist";

class AnilistModel extends MetaModel {
  url = "https://graphql.anilist.co";
  name = "Anilist";

  private homeFeedQuery = `
      query HomeFeed {
        trendingAnime: Page(perPage: 6) {
          media(sort: TRENDING_DESC, type: ANIME) {
            id
            title { romaji english native }
            type format
            coverImage { extraLarge color }
            averageScore episodes status description(asHtml: false) genres
          }
        }
        popularManga: Page(perPage: 6) {
          media(sort: POPULARITY_DESC, type: MANGA) {
            id
            title { romaji english native }
            type format
            coverImage { extraLarge color }
            averageScore chapters volumes status description(asHtml: false) genres
          }
        }
        manhwa: Page(perPage: 6) {
          media(sort: POPULARITY_DESC, type: MANGA, countryOfOrigin: KR) {
            id
            title { romaji english native }
            type format
            coverImage { extraLarge color }
            averageScore chapters status description(asHtml: false) genres
          }
        }
        lightNovels: Page(perPage: 6) {
          media(sort: POPULARITY_DESC, type: MANGA, format: NOVEL) {
            id
            title { romaji english native }
            type format
            coverImage { extraLarge color }
            averageScore chapters status description(asHtml: false) genres
          }
        }
      }
    `;

  async fetchHomeFeed(): Promise<HomeFeed> {
    const body = JSON.stringify({ query: this.homeFeedQuery });

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
