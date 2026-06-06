import { MapResult } from "../mappers/AbstractMediaMapper";
import { MangaMapper } from "../mappers/MangaMapper";
import { TopmanhuaMangaInfo } from "../types/topmanhua";
import AnilistService from "./meta/AnilistService";

export class UnifiedMediaService {
  private mappers = {
    MANGA: new MangaMapper(),
    ANIME: null
  };

  private async determineMediaType(
    query: string
  ): Promise<"ANIME" | "MANGA"> {
    try {
      const results = await AnilistService.getSearchResults(query, "ANIME", 1, 1);
      
      if (results.items && results.items.length > 0) {
        const firstResult = results.items[0];
        const type = firstResult.type as "ANIME" | "MANGA";
        
        if (this.mappers[type]) {
          return type;
        }
      }
    } catch (error) {
      console.warn("Failed to determine media type from ANIME search, trying MANGA");
    }
    
    try {
      const results = await AnilistService.getSearchResults(query, "MANGA", 1, 1);
      
      if (results.items && results.items.length > 0) {
        const firstResult = results.items[0];
        const type = firstResult.type as "ANIME" | "MANGA";
        
        if (this.mappers[type]) {
          return type;
        }
      }
    } catch (error) {
      console.warn("Failed to determine media type from MANGA search");
    }
    
    return "MANGA";
  }

  async search(
    query: string,
    type?: "ANIME" | "MANGA"
  ): Promise<MapResult<TopmanhuaMangaInfo>[]> {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query is required");
    }

    let searchType = type;

    if (!searchType) {
      searchType = await this.determineMediaType(query);
    }

    const mapper = this.mappers[searchType];
    if (!mapper) {
      throw new Error(`${searchType} provider is not yet implemented`);
    }

    return mapper.search(query, searchType);
  }

  async getInfo(
    identifier: string | number,
    type?: "ANIME" | "MANGA"
  ): Promise<MapResult<TopmanhuaMangaInfo>> {
    if (!identifier) {
      throw new Error("Identifier is required");
    }

    let mediaType = type;

    if (!mediaType) {
      try {
        const anilistItem = await AnilistService.getMediaById(
          typeof identifier === "number" ? identifier : parseInt(identifier)
        );
        
        mediaType = anilistItem.type as "ANIME" | "MANGA";
      } catch (error) {
        throw new Error("Failed to determine media type from AniList. Please specify type parameter.");
      }
    }

    const mapper = this.mappers[mediaType];
    if (!mapper) {
      throw new Error(`${mediaType} provider is not yet implemented`);
    }

    return mapper.getInfo(identifier, mediaType);
  }

  getAvailableTypes(): string[] {
    return Object.entries(this.mappers)
      .filter(([, mapper]) => mapper !== null)
      .map(([type]) => type);
  }
}

export default new UnifiedMediaService();
