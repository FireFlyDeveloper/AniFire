export interface ProviderResult {
  id: string;
  title: string;
  url: string;
}

export interface CombinedMediaResult<T = any> {
  id: number;
  anilistId: number;
  title: {
    romaji: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  type: string;
  format: string;
  status: string;
  description?: string;
  genres?: string[];
  averageScore?: number;
  popularity?: number;
  coverImage?: {
    large?: string;
    medium?: string;
  };
  providerMatches?: {
    provider: string;
    data?: T;
    confidence: number;
  }[];
}
