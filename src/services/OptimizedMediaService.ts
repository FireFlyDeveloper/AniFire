import { MapResult } from "../mappers/AbstractMediaMapper";
import { MangaMapper } from "../mappers/MangaMapper";
import { TopmanhuaMangaInfo } from "../types/topmanhua";
import AnilistService from "./meta/AnilistService";
import CacheService from "./CacheService";
import { RequestPool } from "../performance";
import { ParallelExecutor } from "../performance";
import { globalPerfMonitor } from "../performance";

export class OptimizedMediaService {
  private mappers = {
    MANGA: new MangaMapper(),
    ANIME: null
  };

  private cache = CacheService;

  // Request deduplication pools
  private searchPool = new RequestPool(30000);
  private infoPool = new RequestPool(30000);
  private typeDetectionPool = new RequestPool(60000);

  // Parallel executor for concurrent operations
  private parallelExecutor = new ParallelExecutor(10);

  /**
   * Optimized search with parallel execution and request deduplication
   */
  async search(
    query: string,
    type?: "ANIME" | "MANGA"
  ): Promise<MapResult<TopmanhuaMangaInfo>[]> {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query is required");
    }

    const cacheKey = `${query}:${type || 'auto'}`;

    // Use request deduplication
    return this.searchPool.execute<MapResult<TopmanhuaMangaInfo>[]>(
      cacheKey,
      () => this.searchWithOptimizations(query, type)
    );
  }

  /**
   * Internal search implementation with optimizations
   */
  private async searchWithOptimizations(
    query: string,
    type?: "ANIME" | "MANGA"
  ): Promise<MapResult<TopmanhuaMangaInfo>[]> {
    // Check cache first
    const cachedResults = await this.cache.getCachedSearch(query);
    if (cachedResults) {
      console.log(`✅ Cache hit for search: ${query}`);
      return cachedResults;
    }

    // Determine media type in parallel if not provided
    let searchType = type;
    if (!searchType) {
      searchType = await this.determineMediaTypeOptimized(query);
    }

    const mapper = this.mappers[searchType];
    if (!mapper) {
      throw new Error(`${searchType} provider is not yet implemented`);
    }

    // Execute mapper search
    const results = await mapper.search(query, searchType);

    // Cache results in parallel
    await this.cacheResultsInParallel(results);

    // Cache search results
    await this.cache.cacheSearchResults(query, results);
    console.log(`✅ Cached search results: ${query}`);

    return results;
  }

  /**
   * Optimized media type detection with parallel search of both types
   */
  private async determineMediaTypeOptimized(query: string): Promise<"ANIME" | "MANGA"> {
    // Use request deduplication for type detection
    return this.typeDetectionPool.execute<"ANIME" | "MANGA">(
      `type-detect:${query}`,
      async () => {
        const endTimer = globalPerfMonitor.start("media-type-detection");

        try {
          // Search both types in parallel
          const { results, successful } = await this.parallelExecutor.executeAllUnbounded([
            () => AnilistService.getSearchResults(query, "ANIME", 1, 1),
            () => AnilistService.getSearchResults(query, "MANGA", 1, 1),
          ]);

          // Find the first successful result with available mapper
          if (successful >= 1) {
            for (const result of results) {
              if (result.items && result.items.length > 0) {
                const firstResult = result.items[0];
                const resolvedType = firstResult.type as "ANIME" | "MANGA";

                if (this.mappers[resolvedType]) {
                  endTimer();
                  console.log(`✅ Detected media type: ${resolvedType}`);
                  return resolvedType;
                }
              }
            }
          }

          console.warn(`⚠️ Could not determine media type, defaulting to MANGA`);
          endTimer();
          return "MANGA";
        } catch (error) {
          console.error("Failed to determine media type in parallel, using MANGA fallback", error);
          endTimer();
          return "MANGA";
        }
      }
    );
  }

  /**
   * Cache results in parallel
   */
  private async cacheResultsInParallel(results: MapResult<TopmanhuaMangaInfo>[]): Promise<void> {
    const cacheTasks = results
      .filter((result) => result.anilistData?.id)
      .map((result) =>
        () => this.cache.saveToDatabase(result.anilistData!.id, result.anilistData!, result)
      );

    await this.parallelExecutor.executeAll(cacheTasks);
  }

  /**
   * Optimized info with request deduplication
   */
  async getInfo(
    identifier: string | number,
    type?: "ANIME" | "MANGA"
  ): Promise<MapResult<TopmanhuaMangaInfo>> {
    if (!identifier) {
      throw new Error("Identifier is required");
    }

    const anilistId = typeof identifier === "number" ? identifier : parseInt(identifier);

    // Use request deduplication
    return this.infoPool.execute<MapResult<TopmanhuaMangaInfo>>(
      `info:${anilistId}`,
      () => this.getInfoWithOptimizations(anilistId, type)
    );
  }

  /**
   * Internal info implementation with optimizations
   */
  private async getInfoWithOptimizations(
    anilistId: number,
    type?: "ANIME" | "MANGA"
  ): Promise<MapResult<TopmanhuaMangaInfo>> {
    // Check cache first
    const cachedResult = await this.cache.getCachedInfo(anilistId);
    if (cachedResult) {
      console.log(`✅ Cache hit for info: ${anilistId}`);
      return cachedResult;
    }

    // Check database
    const dbResult = await this.cache.loadFromDatabase(anilistId);
    if (dbResult) {
      console.log(`✅ Database hit for info: ${anilistId}`);
      await this.cache.cacheInfoResult(anilistId, dbResult);
      return dbResult;
    }

    // Determine media type if not provided
    let mediaType = type;
    if (!mediaType) {
      mediaType = await this.determineInfoMediaType(anilistId);
    }

    const mapper = this.mappers[mediaType];
    if (!mapper) {
      throw new Error(`${mediaType} provider is not yet implemented`);
    }

    const result = await mapper.getInfo(anilistId, mediaType);

    // Cache result
    await Promise.all([
      this.cache.saveToDatabase(anilistId, result.anilistData, result),
      this.cache.cacheInfoResult(anilistId, result),
    ]);

    console.log(`✅ Cached info result: ${anilistId}`);
    return result;
  }

  /**
   * Determine media type for info endpoint (optimized)
   */
  private async determineInfoMediaType(anilistId: number): Promise<"ANIME" | "MANGA"> {
    const endTimer = globalPerfMonitor.start("info-type-detection");

    try {
      const anilistItem = await AnilistService.getMediaById(anilistId);
      const mediaType = anilistItem.type as "ANIME" | "MANGA";
      endTimer();
      return mediaType;
    } catch (error) {
      endTimer();
      throw new Error("Failed to determine media type from AniList. Please specify type parameter.");
    }
  }

  /**
   * Get available types
   */
  getAvailableTypes(): string[] {
    return Object.entries(this.mappers)
      .filter(([, mapper]) => mapper !== null)
      .map(([type]) => type);
  }

  /**
   * Initialize cache services
   */
  async initialize(): Promise<void> {
    await this.cache.initialize();
  }

  /**
   * Get cache and performance statistics
   */
  async getStats(): Promise<any> {
    const cacheStats = await this.cache.getStats();
    const perfStats = globalPerfMonitor.getAllMetricsAsObject();

    return {
      ...cacheStats,
      availableTypes: this.getAvailableTypes(),
      performance: perfStats,
      requestPool: {
        searchActive: this.searchPool.getActiveCount(),
        infoActive: this.infoPool.getActiveCount(),
        typeDetectionActive: this.typeDetectionPool.getActiveCount(),
      },
    };
  }

  /**
   * Cleanup stale requests and metrics
   */
  async cleanup(): Promise<void> {
    this.searchPool.cleanup();
    this.infoPool.cleanup();
    this.typeDetectionPool.cleanup();
    console.log("✅ Request pools cleaned up");
  }
}

export default new OptimizedMediaService();
