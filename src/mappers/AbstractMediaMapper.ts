import { MediaItem } from "../types/meta/anilist";

export interface MapResult<T = any, U = any> {
  anilistData: MediaItem;
  providerData?: T;
  providerInfo?: U;
  confidence: number;
}

export abstract class AbstractMediaMapper<T = any, U = any> {
  abstract search(query: string, type: "ANIME" | "MANGA"): Promise<MapResult<U>[]>;
  abstract getInfo(
    identifier: string | number,
    type: "ANIME" | "MANGA"
  ): Promise<MapResult<U>>;

  protected calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;

    const len1 = s1.length;
    const len2 = s2.length;
    const matrix = Array(len1 + 1)
      .fill(0)
      .map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] =
            Math.min(
              matrix[i - 1][j - 1],
              matrix[i][j - 1],
              matrix[i - 1][j]
            ) + 1;
        }
      }
    }

    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 0 : 1 - matrix[len1][len2] / maxLen;
  }

  protected findBestMatch(
    searchTerm: string,
    providerResults: Array<{ title: string; data: any }>
  ): { match: any; confidence: number } | null {
    if (!providerResults.length) return null;

    let bestMatch: any = null;
    let highestConfidence = 0;

    for (const providerResult of providerResults) {
      const confidence = this.calculateSimilarity(
        searchTerm,
        providerResult.title
      );

      if (confidence > highestConfidence && confidence > 0.6) {
        highestConfidence = confidence;
        bestMatch = providerResult.data;
      }
    }

    if (!bestMatch) return null;

    return { match: bestMatch, confidence: highestConfidence };
  }
}

export default AbstractMediaMapper;
