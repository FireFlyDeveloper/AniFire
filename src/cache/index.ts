import pool from "../database";
import redis from "../redis";

export async function getCacheStats(): Promise<{
  redis: { connected: boolean; keys: number };
  postgresql: { connected: boolean; cachedItems: number };
}> {
  try {
    const [redisKeys, dbStats] = await Promise.all([
      redis.keys("anifire:*"),
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

export async function clearCache(type?: "redis" | "postgresql" | "all"): Promise<void> {
  try {
    if (type === "redis" || type === "all") {
      const keys = await redis.keys("anifire:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    if (type === "postgresql" || type === "all") {
      await pool.query("TRUNCATE TABLE provider_matches CASCADE");
      await pool.query("TRUNCATE TABLE manga_cache CASCADE");
    }
  } catch (error) {
    console.error("Failed to clear cache:", error);
    throw error;
  }
}

export default { getCacheStats, clearCache };
