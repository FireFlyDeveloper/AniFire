export const ANILIST_QUERIES = {
  HOME_FEED: `
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
  `,
} as const

export type AnilistQuery = keyof typeof ANILIST_QUERIES