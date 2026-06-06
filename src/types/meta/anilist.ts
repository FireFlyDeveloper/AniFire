// Title interfaces
export interface MediaTitle {
  romaji: string;
  english?: string;
  native?: string;
  userPreferred?: string;
}

// Date interfaces
export interface FuzzyDate {
  year?: number;
  month?: number;
  day?: number;
}

// Image interfaces
export interface MediaCoverImage {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
}

// Tag interface
export interface MediaTag {
  name: string;
  rank?: number;
  isGeneralSpoiler?: boolean;
  isMediaSpoiler?: boolean;
  isAdult?: boolean;
}

// Studio interface
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

// Ranking interface
export interface MediaRanking {
  rank?: number;
  type?: string;
  allTime?: boolean;
  context?: string;
  year?: number;
  season?: string;
  format?: string;
}

// External Link interface
export interface MediaExternalLink {
  id: number;
  url: string;
  site: string;
  type?: string;
  language?: string;
  color?: string;
  icon?: string;
}

// Streaming Episode interface
export interface MediaStreamingEpisode {
  title?: string;
  thumbnail?: string;
  url?: string;
  site?: string;
}

// Trailer interface
export interface Trailer {
  id?: string;
  site?: string;
  thumbnail?: string;
}

// Base Media interface with all comprehensive fields
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
  source?: string; // Manga, Light Novel, etc.
  startDate?: FuzzyDate;
  endDate?: FuzzyDate;
  season?: string;
  seasonYear?: number;
  seasonInt?: number;
  episodes?: number;
  duration?: number; // in minutes
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

// Home Feed interfaces
export interface HomeFeed {
  anime: MediaItem[];
  manga: MediaItem[];
  manhwa: MediaItem[];
  novels: MediaItem[];
}

export interface MediaItemCategory extends MediaItem {
  category: string;
}

// Search Result interfaces
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

// Seasonal Anime interface
export interface SeasonalAnimeResult {
  media: MediaItem[];
  season: string;
  year: number;
}

// Trending Media interface
export interface TrendingMediaResult {
  media: MediaItem[];
  type: string;
}

// Media Detail interface
export interface MediaDetail extends MediaItem {
  // Additional fields that might be fetched in detail view
  // All base fields are included via extends MediaItem
}

// Type aliases for convenience
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

// GraphQL Response Types

// Common Type Structures
export interface MediaList {
  media: MediaItem[];
}

export interface PaginatedMediaList {
  pageInfo: PageInfo;
  media: MediaItem[];
}

// Home Feed GraphQL Response
export interface HomeFeedGraphQLResponse {
  data: {
    trendingAnime: MediaList;
    popularManga: MediaList;
    manhwa: MediaList;
    lightNovels: MediaList;
  };
}

// Search GraphQL Response
export interface SearchGraphQLResponse {
  data: {
    Page: PaginatedMediaList;
  };
}

// Media By ID GraphQL Response
export interface MediaByIdGraphQLResponse {
  data: {
    Media: MediaItem;
  };
}

// Seasonal Anime GraphQL Response
export interface SeasonalAnimeGraphQLResponse {
  data: {
    Page: PaginatedMediaList;
  };
}

// Trending Media GraphQL Response
export interface TrendingMediaGraphQLResponse {
  data: {
    Page: PaginatedMediaList;
  };
}
