export interface MediaTitle {
  romaji: string;
  english?: string;
  native?: string;
  userPreferred?: string;
}

export interface FuzzyDate {
  year?: number;
  month?: number;
  day?: number;
}

export interface MediaCoverImage {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
}

export interface MediaTag {
  name: string;
  rank?: number;
  isGeneralSpoiler?: boolean;
  isMediaSpoiler?: boolean;
  isAdult?: boolean;
}

export interface Studio {
  id: number;
  name: string;
  isAnimationStudio?: boolean;
  siteUrl?: string;
}

export interface StudioConnection {
  nodes?: Studio[];
  edges?: StudioEdge[];
}

export interface StudioEdge {
  isMain?: boolean;
}

export interface MediaRanking {
  rank?: number;
  type?: string;
  allTime?: boolean;
  context?: string;
  year?: number;
  season?: string;
  format?: string;
}

export interface MediaExternalLink {
  id: number;
  url: string;
  site: string;
  type?: string;
  language?: string;
  color?: string;
  icon?: string;
}

export interface MediaStreamingEpisode {
  title?: string;
  thumbnail?: string;
  url?: string;
  site?: string;
}

export interface Trailer {
  id?: string;
  site?: string;
  thumbnail?: string;
}

export interface MediaItem {
  id: number;
  title: MediaTitle;
  type: string;
  format: string;
  status: string;
  description?: string;
  synonyms?: string[];
  isAdult: boolean;
  countryOfOrigin?: string;
  source?: string;
  startDate?: FuzzyDate;
  endDate?: FuzzyDate;
  season?: string;
  seasonYear?: number;
  seasonInt?: number;
  episodes?: number;
  duration?: number;
  averageScore?: number;
  meanScore?: number;
  popularity?: number;
  favourites?: number;
  trending?: number;
  genres?: string[];
  tags?: MediaTag[];
  chapters?: number;
  volumes?: number;
  studios?: StudioConnection;
  rankings?: MediaRanking[];
  externalLinks?: MediaExternalLink[];
  streamingEpisodes?: MediaStreamingEpisode[];
  trailer?: Trailer;
  coverImage: MediaCoverImage;
  bannerImage?: string;
  siteUrl?: string;
}

export interface HomeFeed {
  anime: MediaItem[];
  manga: MediaItem[];
  manhwa: MediaItem[];
  novels: MediaItem[];
}

export interface MediaItemCategory extends MediaItem {
  category: string;
}

export interface PageInfo {
  total?: number;
  perPage?: number;
  currentPage?: number;
  lastPage?: number;
  hasNextPage?: boolean;
}

export interface SearchResult {
  items: MediaItem[];
  pageInfo: PageInfo;
}

export interface SeasonalAnimeResult {
  media: MediaItem[];
  season: string;
  year: number;
}

export interface TrendingMediaResult {
  media: MediaItem[];
  type: string;
}

export interface MediaDetail extends MediaItem {}

export type MediaType = "ANIME" | "MANGA";

export type MediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC"
  | "MANGA"
  | "NOVEL"
  | "ONE_SHOT";

export type MediaStatus =
  | "FINISHED"
  | "RELEASING"
  | "NOT_YET_RELEASED"
  | "CANCELLED"
  | "HIATUS";

export type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export type MediaSource =
  | "ORIGINAL"
  | "MANGA"
  | "LIGHT_NOVEL"
  | "VISUAL_NOVEL"
  | "VIDEO_GAME"
  | "OTHER"
  | "NOVEL"
  | "DOUJINSHI"
  | "ANIME"
  | "WEB_MANGA"
  | "WEB_NOVEL"
  | "COMIC"
  | "GAME";

export interface MediaList {
  media: MediaItem[];
}

export interface PaginatedMediaList {
  pageInfo: PageInfo;
  media: MediaItem[];
}

export interface HomeFeedGraphQLResponse {
  data: {
    trendingAnime: MediaList;
    popularManga: MediaList;
    manhwa: MediaList;
    lightNovels: MediaList;
  };
}

export interface SearchGraphQLResponse {
  data: {
    Page: PaginatedMediaList;
  };
}

export interface MediaByIdGraphQLResponse {
  data: {
    Media: MediaItem;
  };
}

export interface SeasonalAnimeGraphQLResponse {
  data: {
    Page: PaginatedMediaList;
  };
}

export interface TrendingMediaGraphQLResponse {
  data: {
    Page: PaginatedMediaList;
  };
}
