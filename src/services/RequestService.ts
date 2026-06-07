import pg from 'pg';

export interface RequestMetrics {
  itemKey: string;
  endpoint: string;
  duration: number;
  ip: string;
}

/**
 * Service for tracking user requests and managing request statistics
 * This provides data for priority-based update scheduling
 */
export class RequestService {
  private db: pg.Client;

  constructor() {
    this.db = new pg.Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'anifire',
      user: process.env.DB_USER || 'casaos',
      password: process.env.DB_PASSWORD
    });

    // Connect immediately
    this.db.connect().catch((err) => {
      console.error('Failed to connect to database in RequestService:', err);
    });
  }

  /**
   * Track a user request
   * Updates request counts, timestamps, and boosts update priority
   */
  async trackRequest(metrics: RequestMetrics): Promise<void> {
    const now = new Date();
    const dayAgo = new Date(Date.now() - 86400000);

    try {
      // Extract anilist_id from itemKey (could be just the ID number)
      const anilistId = this.extractAnilistId(metrics.itemKey);

      // 1. Update manga_cache statistics
      const updateQuery = `
        UPDATE manga_cache
        SET
          request_count = COALESCE(request_count, 0) + 1,
          last_request_time = $2,
          recent_requests = (
            SELECT COUNT(*)
            FROM request_history
            WHERE anilist_id = $1 AND request_time > $3
          ),
          update_priority = COALESCE(update_priority, 1.0) + 0.5
        WHERE anilist_id = $1
      `;

      await this.db.query(updateQuery, [anilistId, now, dayAgo]);

      // 2. Record request history
      const historyQuery = `
        INSERT INTO request_history (anilist_id, endpoint, user_ip, request_time, duration_ms)
        VALUES ($1, $2, $3, $4, $5)
      `;

      await this.db.query(historyQuery, [
        anilistId,
        metrics.endpoint,
        metrics.ip,
        now,
        metrics.duration
      ]);

      // 3. Update update_statistics
      const statsQuery = `
        INSERT INTO update_statistics (anilist_id, total_requests)
        VALUES ($1, 1)
        ON CONFLICT (anilist_id)
        DO UPDATE SET
          total_requests = update_statistics.total_requests + 1
      `;

      await this.db.query(statsQuery, [anilistId]);

      console.log(`✅ Request tracked: ${anilistId} (${metrics.endpoint})`);
    } catch (error) {
      console.error('Failed to track request:', error);
      throw error;
    }
  }

  /**
   * Extract anilist_id from itemKey
   * Handles both numeric IDs and string IDs
   */
  private extractAnilistId(itemKey: string): number {
    // Try to parse as number directly
    const num = parseInt(itemKey);
    if (!isNaN(num)) {
      return num;
    }

    // Try to extract ID from pattern like "naruto-123" or "title-id"
    const match = itemKey.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]);
    }

    // Fallback - use hash (not ideal but works)
    throw new Error(`Could not extract anilist_id from itemKey: ${itemKey}`);
  }

  /**
   * Get items with most recent requests (trending)
   */
  async getMostRequested(limit: number = 20): Promise<any[]> {
    const query = `
      SELECT
        anilist_id,
        title,
        request_count,
        recent_requests,
        last_request_time,
        update_priority,
        updated_at as last_update,
        average_score as avg_score,
        popularity
      FROM manga_cache
      WHERE title IS NOT NULL
      ORDER BY
        recent_requests DESC,
        last_request_time DESC NULLS LAST,
        request_count DESC
      LIMIT $1
    `;

    const result = await this.db.query(query, [limit]);
    return result.rows;
  }

  /**
   * Get request statistics for an item
   */
  async getItemStats(itemKey: string): Promise<any> {
    const anilistId = this.extractAnilistId(itemKey);

    const query = `
      SELECT
        mc.anilist_id,
        mc.title,
        COALESCE(mc.request_count, 0) as request_count,
        COALESCE(mc.recent_requests, 0) as recent_requests,
        mc.last_request_time,
        mc.update_priority,
        COALESCE(us.total_requests, 0) as total_requests,
        COALESCE(us.update_count, 0) as update_count,
        us.average_update_interval
      FROM manga_cache mc
      LEFT JOIN update_statistics us ON mc.anilist_id = us.anilist_id
      WHERE mc.anilist_id = $1
    `;

    const result = await this.db.query(query, [anilistId]);
    return result.rows[0] || null;
  }

  /**
   * Get overall request statistics
   */
  async getOverallStats(): Promise<any> {
    const query = `
      SELECT
        COUNT(*) as total_items,
        SUM(COALESCE(request_count, 0)) as total_requests,
        SUM(COALESCE(recent_requests, 0)) as total_recent_requests,
        AVG(COALESCE(request_count, 0)) as avg_requests_per_item,
        MAX(request_count) as max_requests,
        COUNT(CASE WHEN recent_requests > 0 THEN 1 END) as items_with_recent_requests
      FROM manga_cache
      WHERE title IS NOT NULL
    `;

    const result = await this.db.query(query);
    return result.rows[0];
  }

  /**
   * Reset recent request count (daily cron job)
   * This creates urgency: items not requested lose priority
   */
  async resetRecentRequests(): Promise<number> {
    const query = `
      UPDATE manga_cache
      SET recent_requests = 0
      WHERE last_request_time < NOW() - INTERVAL '24 hours'
      RETURNING key
    `;

    const result = await this.db.query(query);
    console.log(`🔄 Reset ${result.rowCount} items with old recent request counts`);
    return result.rowCount || 0;
  }

  /**
   * Get items needing update based on request activity
   */
  async getPriorityItems(limit: number = 100): Promise<string[]> {
    const query = `
      SELECT anilist_id::text as id
      FROM manga_cache
      WHERE
        anilist_id IS NOT NULL
        AND title IS NOT NULL
      ORDER BY
        -- Priority scoring:
        recent_requests DESC,
        (update_priority * 2.0) DESC,
        last_request_time DESC NULLS LAST,
        updated_at ASC
      LIMIT $1
    `;

    const result = await this.db.query(query, [limit]);
    return result.rows.map(row => row.id);
  }
}
