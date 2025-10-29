export interface MediaTitle {
  romaji: string;
  english?: string;
  native?: string;
}

export interface MediaItem {
  id: number;
  title: MediaTitle;
  type: string;
  format: string;
  coverImage: {
    extraLarge: string;
    color?: string;
  };
  averageScore?: number;
  episodes?: number;
  chapters?: number;
  volumes?: number;
  status?: string;
  description?: string;
  genres?: string[];
}

export interface HomeFeed {
  anime: MediaItem[];
  manga: MediaItem[];
  manhwa: MediaItem[];
  novels: MediaItem[];
}
