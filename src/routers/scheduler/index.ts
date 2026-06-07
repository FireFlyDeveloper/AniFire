import { Hono } from 'hono';
import { cronScheduler } from '../../services/CronScheduler';

const router = new Hono();

/**
 * Scheduler Status Routes
 * Endpoints for monitoring and controlling the cron scheduler
 */

// Health check
router.get('/', (c) => {
  const status = cronScheduler.getStatus();

  return c.json({
    service: 'AniFire Cron Scheduler',
    version: '1.0.0',
    status: {
      updateCycle: status.updateCycle ? 'Active' : 'Inactive',
      dailyReset: status.dailyReset ? 'Active' : 'Inactive',
    },
    schedule: {
      updateCycle: 'Every 5 minutes (*/5 * * * *)',
      dailyReset: 'Every day at midnight (0 0 * * *)',
    },
    features: {
      codeBased: true,
      noSystemD: true,
      autoStart: true,
      manualTrigger: true,
    },
  });
});

// Get scheduler status
router.get('/status', (c) => {
  const status = cronScheduler.getStatus();

  return c.json({
    timestamp: new Date().toISOString(),
    tasks: status,
  });
});

// Manually trigger update cycle (for testing)
router.post('/trigger-update', async (c) => {
  try {
    await cronScheduler.triggerManualUpdate();

    return c.json({
      message: 'Update cycle triggered manually',
      timestamp: new Date().toISOString(),
      status: 'success',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return c.json(
      {
        error: 'Failed to trigger update cycle',
        details: errorMessage,
        timestamp: new Date().toISOString(),
        status: 'error',
      },
      500
    );
  }
});

// Manually trigger daily reset (for testing)
router.post('/trigger-reset', async (c) => {
  try {
    await cronScheduler.triggerManualReset();

    return c.json({
      message: 'Daily reset triggered manually',
      timestamp: new Date().toISOString(),
      status: 'success',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return c.json(
      {
        error: 'Failed to trigger daily reset',
        details: errorMessage,
        timestamp: new Date().toISOString(),
        status: 'error',
      },
      500
    );
  }
});

export default router;
