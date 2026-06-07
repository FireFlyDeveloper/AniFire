import { Hono } from 'hono';
import { RequestStatsController } from '../../controllers/RequestStatsController';

const router = new Hono();
const controller = new RequestStatsController();

/**
 * Request Statistics Routes
 * Endpoints for tracking user requests and analyzing request patterns
 */

// Health check
router.get('/', (c) => {
  return c.json({
    service: 'AniFire Request API',
    version: '1.0.0',
    features: {
      requestTracking: true,
      priorityScoring: true,
      trendingAnalysis: true,
      requestStats: true,
    },
  });
});

// Get most requested items (trending)
router.get('/trending', controller.getTrending);

// Get request statistics for a specific item
router.get('/stats/:id', controller.getItemStats);

// Get overall request statistics
router.get('/overview', controller.getOverview);

// Get priority queue preview
router.get('/priority', controller.getPriorityQueue);

// Reset recent request counts (manual or cron)
router.post('/reset', controller.resetRecentRequests);

export default router;
