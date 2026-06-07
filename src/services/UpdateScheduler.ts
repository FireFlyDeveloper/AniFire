import Redis from 'ioredis';
import pg from 'pg';
import { UpdatePriorityCalculator } from './UpdatePriorityCalculator';
import { RequestService } from './RequestService';

export interface UpdateTask {
  itemId: string;
  priority: number;
  attemptedAt: number;
  retryCount: number;
}

interface UpdateResult {
  itemId: string;
  success: boolean;
  changed: boolean;
  duration: number;
}

/**
 * Update Scheduler with Priority Queue
 * Only updates items that exist in the database (manga_cache)
 * Uses intelligent priority scoring based on user requests
 */
export class UpdateScheduler {
  private redis: Redis;
  private priorityCalc: UpdatePriorityCalculator;
  private requestService: RequestService;
  private db: pg.Client | null;

  constructor() {
    this.redis = new Redis({
      enableOfflineQueue: true,
      keepAlive: 30000,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
    this.priorityCalc = new UpdatePriorityCalculator();
    this.requestService = new RequestService();

    // Create database connection (only if password available)
    const dbPassword = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD;

    if (dbPassword) {
      this.db = new pg.Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'anifire',
        user: process.env.DB_USER || 'casaos',
        password: dbPassword
      });

      this.db.connect().catch((err) => {
        console.error('Failed to connect to database in UpdateScheduler:', err);
      });
    } else {
      console.warn('⚠️  UpdateScheduler: Database password not found, database features disabled');
      this.db = null;
    }
  }

  /**
   * Helper method to safely execute queries
   */
  private async query(text: string, params?: any[]): Promise<any> {
    if (!this.db) {
      throw new Error('Database connection not available');
    }
    return await this.db.query(text, params);
  }

  /**
   * Select items to update based on priority
   * Only selects items that exist in manga_cache
   */
  async selectItemsToUpdate(count: number = 100): Promise<string[]> {
    const ids = await this.requestService.getPriorityItems(count);
    console.log(`📦 Selected ${ids.length} items for update`);
    return ids;
  }

  /**
   * Enqueue an update task
   */
  async enqueueUpdate(itemId: string, priority: number = 1): Promise<void> {
    const task: UpdateTask = {
      itemId,
      priority,
      attemptedAt: Date.now(),
      retryCount: 0
    };

    await this.redis.zadd(
      'update:queue',
      priority,
      JSON.stringify(task)
    );
  }

  /**
   * Dequeue highest priority tasks
   */
  async dequeueUpdate(count: number = 10): Promise<UpdateTask[]> {
    // Get the highest priority items (highest score)
    const tasks = await this.redis.zrevrange('update:queue', 0, count - 1);

    if (tasks.length > 0) {
      await this.redis.zremrangebyrank('update:queue', 0, count - 1);
    }

    return tasks.map((t) => JSON.parse(t));
  }

  /**
   * Re-queue failed task with backoff
   */
  async retryUpdate(task: UpdateTask, error: Error): Promise<void> {
    task.retryCount++;

    if (task.retryCount > 3) {
      console.error(`❌ Max retries exceeded for ${task.itemId}:`, error.message);
      return;
    }

    // Exponential backoff (reduce priority)
    task.priority *= 0.5;
    task.attemptedAt = Date.now();

    await this.redis.zadd(
      'update:queue',
      task.priority,
      JSON.stringify(task)
    );
  }

  /**
   * Main update cycle loop
   * Continuously processes update queue with intelligent scheduling
   */
  async updateCycle(): Promise<void> {
    console.log('🔄 Starting smart update cycle...');

    const batchSize = 50;

    while (true) {
      try {
        // 1. Dequeue batch
        const tasks = await this.dequeueUpdate(batchSize);

        if (tasks.length === 0) {
          console.log('✅ Queue empty, waiting for new tasks...');
          await this.sleep(60000);
          continue;
        }

        console.log(`📦 Processing ${tasks.length} update tasks...`);

        // 2. Process in parallel (limit concurrency)
        const results = await this.parallelProcess(
          tasks,
          10,
          async (task: UpdateTask) => await this.updateItem(task)
        );

        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;
        const changed = results.filter((r) => r.changed).length;

        console.log(
          `✅ ${successful} succeeded, ❌ ${failed} failed, ✨ ${changed} changed`
        );

        // 3. Wait before next batch
        await this.sleep(5000);
      } catch (error) {
        console.error('💥 Update cycle error:', error);
        await this.sleep(30000);
      }
    }
  }

  /**
   * Process a single update task with change detection
   */
  private async updateItem(task: UpdateTask): Promise<UpdateResult> {
    const startTime = Date.now();

    try {
      const changed = await this.updateWithDetection(task.itemId);

      const duration = Date.now() - startTime;

      if (changed) {
        console.log(`✨ Updated: ${task.itemId} (${duration}ms)`);
        await this.notifySubscribers(task.itemId);
      }

      return { itemId: task.itemId, success: true, changed, duration };
    } catch (error) {
      console.error(`❌ Update failed for ${task.itemId}:`, error);
      await this.retryUpdate(task, error as Error);

      const duration = Date.now() - startTime;
      return { itemId: task.itemId, success: false, changed: false, duration };
    }
  }

  /**
   * Update with change detection
   * Skip if content hasn't actually changed
   */
  private async updateWithDetection(itemId: string): Promise<boolean> {
    const cached = await this.getCachedItem(itemId);

    if (!cached) {
      // New item - full update
      await this.fullUpdate(itemId);
      return true;
    }

    // Check adaptive frequency
    const shouldUpdate = await this.shouldUpdate(itemId);
    if (!shouldUpdate) {
      return false;
    }

    // Fetch fresh data (placeholder - provider-specific)
    const fresh = await this.fetchFromProvider(itemId);

    // Generate hash
    const oldHash = cached.last_hash;
    const newHash = this.priorityCalc.generateContentHash(fresh);

    if (oldHash === newHash) {
      // No change - just update timestamp
      await this.updateMetadata(itemId, {
        last_update: new Date(),
        last_hash: newHash
      });
      return false;
    }

    // Content changed - full update
    await this.fullUpdate(itemId, { last_hash: newHash });

    // Record update for learning
    await this.recordUpdate(itemId, fresh.chapters?.length || 0, true);

    return true;
  }

  /**
   * Parallel processing with concurrency limit
   */
  private async parallelProcess(
    items: any[],
    concurrency: number,
    fn: Function
  ): Promise<UpdateResult[]> {
    const results: UpdateResult[] = [];
    const executing = new Set<Promise<UpdateResult>>();

    for (const item of items) {
      const promise = fn(item).then((result: UpdateResult) => {
        executing.delete(promise);
        return result;
      });

      this.executing.add(promise);
      results.push(promise);

      if (this.executing.size >= concurrency) {
        await Promise.race(this.executing);
      }
    }

    return Promise.all(results);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================================
  // Placeholder methods - to be implemented with actual providers
  // ============================================================

  private async getCachedItem(id: string): Promise<any> {
    const query = 'SELECT * FROM manga_cache WHERE key = $1';
    const result = await this.query(query, [id]);
    return result.rows[0] || null;
  }

  private async fetchFromProvider(id: string): Promise<any> {
    // Provider-specific implementation
    // This would call the appropriate model/service
    throw new Error('Provider fetch not implemented yet');
  }

  private async fullUpdate(id: string, metadata?: any): Promise<void> {
    // Update cache with fresh data
    // This would update manga_cache table
    console.log(`🔄 Full update for ${id}`);
  }

  private async updateMetadata(id: string, metadata: any): Promise<void> {
    const query = `
      UPDATE manga_cache
      SET last_update = $1, last_hash = $2
      WHERE key = $3
    `;
    await this.query(query, [metadata.last_update, metadata.last_hash, id]);
  }

  private async shouldUpdate(id: string): Promise<boolean> {
    // Check adaptive frequency against last_update
    return true;
  }

  private async recordUpdate(
    id: string,
    chapterCount: number,
    changed: boolean
  ): Promise<void> {
    const query = `
      INSERT INTO update_history (item_key, update_time, chapter_count, change_detected)
      VALUES ($1, NOW(), $2, $3)
    `;
    await this.query(query, [id, chapterCount, changed]);
  }

  private async notifySubscribers(id: string): Promise<void> {
    // Trigger webhooks for changed items
    console.log(`🔔 Notified subscribers for ${id}`);
  }

  private executing = new Set<Promise<UpdateResult>>();
}
