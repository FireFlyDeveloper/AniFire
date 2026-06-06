import { MapResult } from "../mappers/AbstractMediaMapper";
import { MangaMapper } from "../mappers/MangaMapper";
import { TopmanhuaMangaInfo } from "../types/topmanhua";
import AnilistService from "./meta/AnilistService";
import CacheService from "./CacheService";

export class UnifiedMediaService {
  private mappers = {
    MANGA: new MangaMapper(),
    ANIME: null
  };

  private cache = CacheService;

  async search(
    query: string,
    type?: "ANIME" | "MANGA"
  ): Promise<MapResult<TopmanhuaMangaInfo>[]> {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query is required");
    }

    const cacheKey = `${query}:${type || 'auto'}`;

    try {
      const cachedResults = await this.cache.getCachedSearch(query);
      if (cachedResults) {
        console.log(`✅ Cache hit for search: ${query}`);
        return cachedResults;
      }
    } catch (error) {
      console.warn(`Failed to check cache for search: ${query}`, error);
    }

    let searchType = type;

    if (!searchType) {
      try {
        const results = await AnilistService.getSearchResults(query, "ANIME", 1, 1);
        
        if (results.items && results.items.length > 0) {
          const firstResult = results.items[0];
          const resolvedType = firstResult.type as "ANIME" | "MANGA";
          
          if (this.mappers[resolvedType]) {
            searchType = resolvedType;
          }
        }
      } catch (error) {
        console.warn("Failed to determine media type from ANIME search, trying MANGA");
      }
      
      if (!searchType) {
        try {
          const results = await AnilistService.getSearchResults(query, "MANGA", 1, 1);
          
          if (results.items && results.items.length > 0) {
            const firstResult = results.items[0];
            const resolvedType = firstResult.type as "ANIME" | "MANGA";
            
            if (this.mappers[resolvedType]) {
              searchType = resolvedType;
            }
          }
        } catch (error) {
          console.warn("Failed to determine media type from MANGA search");
        }
      }
      
      if (!searchType) {
        searchType = "MANGA";
      }
    }

    const mapper = this.mappers[searchType];
    if (!mapper) {
      throw new Error(`${searchType} provider is not yet implemented`);
    }

    const results = await mapper.search(query, searchType);

    try {
      await Promise.all(
        results.map(async (result) => {
          if (result.anilistData?.id) {
            await this.cache.saveToDatabase(result.anilistData.id, result.anilistData, result);
          }
        })
      );

      await this.cache.cacheSearchResults(query, results);
      console.log(`✅ Cached search results: ${query}`);
    } catch (error) {
      console.error(`Failed to cache search results: ${query}`, error);
    }

    return results;
  }

  async getInfo(
    identifier: string | number,
    type?: "ANIME" | "MANGA"
  ): Promise<MapResult<TopmanhuaMangaInfo>> {
    if (!identifier) {
      throw new Error("Identifier is required");
    }

    const anilistId = typeof identifier === "number" ? identifier : parseInt(identifier);

    try {
      const cachedResult = await this.cache.getCachedInfo(anilistId);
      if (cachedResult) {
        console.log(`✅ Cache hit for info: ${anilistId}`);
        return cachedResult;
      }
    } catch (error) {
      console.warn(`Failed to check cache for info: ${anilistId}`, error);
    }

    try {
      const dbResult = await this.cache.loadFromDatabase(anilistId);
      if (dbResult) {
        console.log(`✅ Database hit for info: ${anilistId}`);
        
        await this.cache.cacheInfoResult(anilistId, dbResult);
        return dbResult;
      }
    } catch (error) {
      console.warn(`Failed to load from database: ${anilistId}`, error);
    }

    let mediaType = type;

    if (!mediaType) {
      try {
        const anilistItem = await AnilistService.getMediaById(anilistId);
        
        mediaType = anilistItem.type as "ANIME" | "MANGA";
      } catch (error) {
        throw new Error("Failed to determine media type from AniList. Please specify type parameter.");
      }
    }

    const mapper = this.mappers[mediaType];
    if (!mapper) {
      throw new Error(`${mediaType} provider is not yet implemented`);
    }

    const result = await mapper.getInfo(anilistId, mediaType);

    try {
      await this.cache.saveToDatabase(anilistId, result.anilistData, result);
      await this.cache.cacheInfoResult(anilistId, result);
      console.log(`✅ Cached info result: ${anilistId}`);
    } catch (error) {
      console.error(`Failed to cache info result: ${anilistId}`, error);
    }

    return result;
  }

  getAvailableTypes(): string[] {
    return Object.entries(this.mappers)
      .filter(([, mapper]) => mapper !== null)
      .map(([type]) => type);
  }

  async initialize(): Promise<void> {
    await this.cache.initialize();
  }

  async getStats(): Promise<{ redis: any; postgresql: any; availableTypes: string[] }> {
    const stats = await this.cache.getStats();
    
    return {
      ...stats,
      availableTypes: this.getAvailableTypes(),
    };
  }
}

export default new UnifiedMediaService();
