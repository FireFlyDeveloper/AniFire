import { Context, Next } from 'hono';

interface RequestMetrics {
  itemKey: string;
  endpoint: string;
  duration: number;
  ip: string;
}

/**
 * Middleware to track user requests for priority scoring
 * Boosts update priority for items frequently requested by users
 */
export async function trackRequest(c: Context, next: Next) {
  const startTime = Date.now();

  await next();

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Only track successful info/search requests
  const path = c.req.path;
  const method = c.req.method;

  if ((path.includes('/info') || path.includes('/search')) && method === 'GET') {
    const itemId = c.req.param('id') || c.req.query('q') || c.req.query('id');

    if (itemId) {
      await recordRequest(itemId, path, duration, c);
    }
  }
}

/**
 * Record a request to the database and boost priority
 */
async function recordRequest(
  itemId: string,
  endpoint: string,
  duration: number,
  c: Context
): Promise<void> {
  // Import here to avoid circular dependency
  const { RequestService } = await import('../services/RequestService');

  const requestService = new RequestService();

  try {
    await requestService.trackRequest({
      itemKey: itemId,
      endpoint,
      duration,
      ip: extractIp(c.req)
    });

    console.log(`📊 Tracked request: ${itemId} (priority boosted)`);
  } catch (error) {
    console.error('Failed to track request:', error);
    // Don't fail the request if tracking fails
  }
}

/**
 * Extract IP address from request headers
 */
function extractIp(c: Context): string {
  const req = c.req;
  const headers = req.header();

  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
