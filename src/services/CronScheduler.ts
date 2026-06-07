import cron from 'node-cron';
import { UpdateScheduler } from '../services/UpdateScheduler';

/**
 * Code-based Cron Scheduler
 * Runs update cycles on a schedule instead of continuous loop
 *
 * Uses node-cron for scheduled execution
 * - No systemd service needed
 * - Simpler to debug and monitor
 * - Easier deployment
 */
export class CronScheduler {
  private updateScheduler: UpdateScheduler;
  private updateCycleTask: cron.ScheduledTask | null = null;
  private dailyResetTask: cron.ScheduledTask | null = null;

  constructor() {
    this.updateScheduler = new UpdateScheduler();
  }

  /**
   * Start all scheduled tasks
   *
   * Update Cycle: Every 5 minutes
   * Daily Reset: Every day at midnight
   */
  start(): void {
    console.log('🕐 Starting Cron Scheduler...');

    // 1. Update Cycle - Every 5 minutes
    this.startUpdateCycle();

    // 2. Daily Reset - Every day at midnight (00:00)
    this.startDailyReset();

    console.log('✅ Cron Scheduler started successfully!');
    this.printSchedule();
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    console.log('🛑 Stopping Cron Scheduler...');

    if (this.updateCycleTask) {
      this.updateCycleTask.stop();
      this.updateCycleTask = null;
    }

    if (this.dailyResetTask) {
      this.dailyResetTask.stop();
      this.dailyResetTask = null;
    }

    console.log('✅ Cron Scheduler stopped');
  }

  /**
   * Start Update Cycle (every 5 minutes)
   */
  private startUpdateCycle(): void {
    // Cron expression: */5 * * * * (every 5 minutes)
    this.updateCycleTask = cron.schedule('*/5 * * * *', async () => {
      await this.runUpdateCycle();
    });

    console.log('📅 Update Cycle scheduled: Every 5 minutes');
  }

  /**
   * Start Daily Reset (once per day at midnight)
   */
  private startDailyReset(): void {
    // Cron expression: 0 0 * * * (at 00:00 every day)
    this.dailyResetTask = cron.schedule('0 0 * * *', async () => {
      await this.runDailyReset();
    });

    console.log('📅 Daily Reset scheduled: Every day at midnight (00:00)');
  }

  /**
   * Run single update cycle
   */
  private async runUpdateCycle(): Promise<void> {
    try {
      console.log(`🔄 Update Cycle started at ${new Date().toISOString()}`);

      const startTime = Date.now();

      // Select items to update
      const batchSize = 50;
      const itemsToUpdate = await this.updateScheduler.selectItemsToUpdate(batchSize);

      if (itemsToUpdate.length === 0) {
        console.log('✅ No items to update in this cycle');
        return;
      }

      console.log(`📦 Processing ${itemsToUpdate.length} items...`);

      // Enqueue items for processing (UpdateScheduler handles the rest)
      for (const itemId of itemsToUpdate) {
        await this.updateScheduler.enqueueUpdate(itemId, 10); // High priority for scheduled updates
      }

      // Let UpdateScheduler handle the actual processing
      // Just log completion
      const duration = Date.now() - startTime;
      console.log(
        `✅ Update Cycle completed: ${itemsToUpdate.length} items enqueued (${duration}ms)`
      );
    } catch (error) {
      console.error('❌ Update Cycle failed:', error);
    }
  }

  /**
   * Run daily reset
   */
  private async runDailyReset(): Promise<void> {
    try {
      console.log(`🔄 Daily Reset started at ${new Date().toISOString()}`);

      const startTime = Date.now();

      // Import and run the RequestService reset
      const { RequestService } = await import('../services/RequestService');
      const requestService = new RequestService();

      const count = await requestService.resetRecentRequests();

      const duration = Date.now() - startTime;

      console.log(
        `✅ Daily Reset completed: ${count} items reset (${duration}ms)`
      );
    } catch (error) {
      console.error('❌ Daily Reset failed:', error);
    }
  }

  /**
   * Print scheduled tasks
   */
  private printSchedule(): void {
    console.log('📋 Scheduled Tasks:');
    console.log('  • Update Cycle: Every 5 minutes (*/5 * * * *)');
    console.log('  • Daily Reset: Every day at midnight (0 0 * * *)');
  }

  /**
   * Get task statuses
   */
  getStatus(): { updateCycle: boolean; dailyReset: boolean } {
    return {
      updateCycle: this.updateCycleTask !== null,
      dailyReset: this.dailyResetTask !== null,
    };
  }

  /**
   * Manually trigger an update cycle (for testing)
   */
  async triggerManualUpdate(): Promise<void> {
    console.log('🚀 Manually triggering update cycle...');
    await this.runUpdateCycle();
  }

  /**
   * Manually trigger daily reset (for testing)
   */
  async triggerManualReset(): Promise<void> {
    console.log('🚀 Manually triggering daily reset...');
    await this.runDailyReset();
  }
}

// Export singleton instance
export const cronScheduler = new CronScheduler();
