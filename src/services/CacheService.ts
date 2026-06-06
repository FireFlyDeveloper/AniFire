import pool from "../database";
import redis from "../redis";
import ImageService from "./ImageService";
import { MediaItem } from "../types/meta/anilist";
import { MapResult } from "../mappers/AbstractMediaMapper";

interface CacheEntry {
  anilistData: MediaItem;
  providerData?: any;
  providerInfo?: any;
  confidence: number;
}

export class CacheService {
  private static instance: CacheService;
  private static readonly CACHE_PREFIX = "anifire:";
  private static readonly CACHE_TTL = 300; // 5 minutes

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private getRedisKey(type: string, identifier: string | number): string {
    return `${CacheService.CACHE_PREFIX}${type}:${identifier}`;
  }

  async getCachedSearch(query: string): Promise<CacheEntry[] | null> {
    try {
      const redisKey = this.getRedisKey("search", query);
      const cached = await redis.get(redisKey);

      if (cached) {
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  async cacheSearchResults(query: string, results: CacheEntry[]): Promise<void> {
    try {
      const redisKey = this.getRedisKey("search", query);
      await redis.setex(redisKey, CacheService.CACHE_TTL, JSON.stringify(results));
    } catch (error) {
      console.error("Redis set error:", error);
    }
  }

  async getCachedInfo(anilistId: number): Promise<CacheEntry | null> {
    try {
      const redisKey = this.getRedisKey("info", anilistId);
      const cached = await redis.get(redisKey);

      if (cached) {
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  async cacheInfoResult(anilistId: number, result: CacheEntry): Promise<void> {
    try {
      const redisKey = this.getRedisKey("info", anilistId);
      await redis.setex(redisKey, CacheService.CACHE_TTL, JSON.stringify(result));
    } catch (error) {
      console.error("Redis set error:", error);
    }
  }

  async saveToDatabase(
    anilistId: number,
    mediaItem: MediaItem,
    result?: CacheEntry
  ): Promise<void> {
    try {
      const coverImageData = await ImageService.downloadCoverImage(mediaItem.coverImage);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const upsertQuery = `
          INSERT INTO manga_cache (
            anilist_id, title, type, format, status, description,
            synonyms, cover_image_url, cover_image_data, cover_image_mime,
            average_score, mean_score, popularity, favourites, chapters, volumes,
            genres, external_links, country_of_origin, source, is_adult
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          ON CONFLICT (anilist_id) DO UPDATE SET
            title = EXCLUDED.title,
            format = EXCLUDED.format,
            status = EXCLUDED.status,
            description = EXCLUDED.description,
            synonyms = EXCLUDED.synonyms,
            cover_image_url = EXCLUDED.cover_image_url,
            cover_image_data = COALESCE(EXCLUDED.cover_image_data, manga_cache.cover_image_data),
            cover_image_mime = COALESCE(EXCLUDED.cover_image_mime, manga_cache.cover_image_mime),
            average_score = EXCLUDED.average_score,
            mean_score = EXCLUDED.mean_score,
            popularity = EXCLUDED.popularity,
            favourites = EXCLUDED.favourites,
            chapters = EXCLUDED.chapters,
            volumes = EXCLUDED.volumes,
            genres = EXCLUDED.genres,
            external_links = EXCLUDED.external_links,
            updated_at = NOW()
          RETURNING id
        `;

        const cacheResult = await client.query(upsertQuery, [
          anilistId,
          JSON.stringify(mediaItem.title),
          mediaItem.type,
          mediaItem.format,
          mediaItem.status,
          mediaItem.description,
          JSON.stringify(mediaItem.synonyms || []),
          mediaItem.coverImage?.large || mediaItem.coverImage?.medium || null,
          coverImageData?.data || null,
          coverImageData?.mimeType || null,
          mediaItem.averageScore || null,
          mediaItem.meanScore || null,
          mediaItem.popularity || null,
          mediaItem.favourites || null,
          mediaItem.chapters || null,
          mediaItem.volumes || null,
          JSON.stringify(mediaItem.genres || []),
          JSON.stringify(mediaItem.externalLinks || []),
          mediaItem.countryOfOrigin,
          mediaItem.source,
          mediaItem.isAdult,
        ]);

        const cacheId = cacheResult.rows[0].id;

        if (result && result.providerData) {
          const providerMatchQuery = `
            INSERT INTO provider_matches (cache_id, provider_name, provider_id, provider_data, chapters_count, confidence)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (cache_id, provider_name) DO UPDATE SET
              provider_id = EXCLUDED.provider_id,
              provider_data = EXCLUDED.provider_data,
              chapters_count = EXCLUDED.chapters_count,
              confidence = EXCLUDED.confidence,
              last_fetched_at = NOW()
          `;

          await client.query(providerMatchQuery, [
            cacheId,
            "topmanhua",
            result.providerData.id,
            JSON.stringify(result.providerData),
            result.providerData.totalChapters,
            result.confidence,
          ]);
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Failed to save to database:", error);
      throw error;
    }
  }

  async loadFromDatabase(anilistId: number): Promise<CacheEntry | null> {
    try {
      const query = `
        SELECT 
          anilist_id,
          title,
          type,
          format,
          status,
          description,
          synonyms,
          average_score,
          mean_score,
          popularity,
          favourites,
          chapters,
          volumes,
          genres,
          external_links,
          country_of_origin,
          source,
          is_adult,
          pm.provider_data,
          pm.chapters_count,
          pm.confidence
        FROM manga_cache
        LEFT JOIN provider_matches pm ON manga_cache.id = pm.cache_id AND pm.provider_name = 'topmanhua'
        WHERE anilist_id = $1
      `;

      const client = await pool.connect();
      try {
        const result = await client.query(query, [anilistId]);

        if (result.rows.length === 0) {
          return null;
        }

        const row = result.rows[0];

        const mediaItem: MediaItem = {
          id: row.anilist_id,
          title: row.title,
          type: row.type,
          format: row.format,
          status: row.status,
          description: row.description,
          synonyms: row.synonyms,
          averageScore: row.average_score,
          meanScore: row.mean_score,
          popularity: row.popularity,
          favourites: row.favourites,
          chapters: row.chapters,
          volumes: row.volumes,
          genres: row.genres,
          externalLinks: row.external_links,
          countryOfOrigin: row.country_of_origin,
          source: row.source,
          isAdult: row.is_adult,
        };

        let cacheEntry: CacheEntry = {
          anilistData: mediaItem,
          confidence: 0,
        };

        if (row.provider_data) {
          cacheEntry = {
            anilistData: mediaItem,
            providerData: row.provider_data,
            providerInfo: row.provider_data,
            confidence: parseFloat(row.confidence),
          };
        }

        return cacheEntry;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Failed to load from database:", error);
      return null;
    }
  }

  async initialize(): Promise<void> {
    try {
      const [redisPing, dbTest] = await Promise.all([
        redis.ping(),
        pool.query("SELECT NOW()"),
      ]);

      console.log("✅ CacheService initialized");
      console.log("  - Redis: Connected");
      console.log("  - PostgreSQL: Connected");
    } catch (error) {
      console.error("❌ Failed to initialize CacheService:", error);
      throw error;
    }
  }

  async getStats(): Promise<{
    redis: { connected: boolean; keys: number };
    postgresql: { connected: boolean; cachedItems: number };
  }> {
    try {
      const [redisKeys, dbStats] = await Promise.all([
        redis.keys(this.getRedisKey("*", "")),
        pool.query("SELECT COUNT(*) as count FROM manga_cache"),
      ]);

      return {
        redis: {
          connected: true,
          keys: redisKeys.length,
        },
        postgresql: {
          connected: true,
          cachedItems: parseInt(dbStats.rows[0].count),
        },
      };
    } catch (error) {
      console.error("Failed to get cache stats:", error);
      return {
        redis: { connected: false, keys: 0 },
        postgresql: { connected: false, cachedItems: 0 },
      };
    }
  }
}

export default CacheService.getInstance();
