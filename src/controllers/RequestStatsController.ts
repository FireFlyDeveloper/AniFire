import { RequestService } from '../services/RequestService';

/**
 * Request Statistics Controller
 * Provides endpoints for tracking and analyzing user requests
 */
export class RequestStatsController {
  private requestService: RequestService;

  constructor() {
    this.requestService = new RequestService();
  }

  /**
   * Get most requested items (trending)
   * GET /api/requests/trending
   */
  async getTrending(c: any): Promise<Response> {
    try {
      const limit = parseInt(c.req.query('limit') || '20');
      const trending = await this.requestService.getMostRequested(limit);

      return c.json({
        trending,
        count: trending.length,
      });
    } catch (error) {
      console.error('Failed to get trending items:', error);
      return c.json(
        {
          error: 'Failed to get trending items',
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }

  /**
   * Get request statistics for a specific item
   * GET /api/requests/stats/:id
   */
  async getItemStats(c: any): Promise<Response> {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Item ID is required' }, 400);
    }

    try {
      const stats = await this.requestService.getItemStats(id);

      if (!stats) {
        return c.json({ error: 'Item not found' }, 404);
      }

      return c.json(stats);
    } catch (error) {
      console.error('Failed to get item stats:', error);
      return c.json(
        {
          error: 'Failed to get item stats',
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }

  /**
   * Get overall request statistics
   * GET /api/requests/overview
   */
  async getOverview(c: any): Promise<Response> {
    try {
      const stats = await this.requestService.getOverallStats();

      return c.json(stats);
    } catch (error) {
      console.error('Failed to get overview stats:', error);
      return c.json(
        {
          error: 'Failed to get overview stats',
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }

  /**
   * Get items needing update (priority queue preview)
   * GET /api/requests/priority
   */
  async getPriorityQueue(c: any): Promise<Response> {
    try {
      const limit = parseInt(c.req.query('limit') || '100');
      const items = await this.requestService.getPriorityItems(limit);

      return c.json({
        priorityQueue: items,
        count: items.length,
      });
    } catch (error) {
      console.error('Failed to get priority queue:', error);
      return c.json(
        {
          error: 'Failed to get priority queue',
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }

  /**
   * Reset recent request counts (manual trigger or cron)
   * POST /api/requests/reset
   */
  async resetRecentRequests(c: any): Promise<Response> {
    try {
      const count = await this.requestService.resetRecentRequests();

      return c.json({
        reset: true,
        itemsReset: count,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to reset recent requests:', error);
      return c.json(
        {
          error: 'Failed to reset recent requests',
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }
}
