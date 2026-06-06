export interface TopmanhuaItem {
  title: string;
  url: string;
}

export interface TopmanhuaSearchResult {
  items: TopmanhuaItem[];
}

export interface TopmanhuaSearchGraphQLResponse {
  data: TopmanhuaSearchResult;
}
