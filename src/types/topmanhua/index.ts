export interface TopmanhuaItem {
  id: string;
  title: string;
  url: string;
}

export interface TopmanhuaSearchResult {
  items: TopmanhuaItem[];
}

export interface TopmanhuaSearchGraphQLResponse {
  data: TopmanhuaSearchResult;
}

export interface TopmanhuaChapter {
  name: string;
  url: string;
}

export interface TopmanhuaMangaInfo {
  id: string;
  alternative: string;
  genres: string[];
  release: string;
  totalChapters: number;
  chapters: TopmanhuaChapter[];
}
