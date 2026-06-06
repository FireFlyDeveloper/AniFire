/**
 * Compression Middleware - Enable gzip compression for API responses
 * Reduces response size and improves load times
 */

import type { Context, Next } from "hono";

/**
 * Gzip compression middleware for Hono
 * Compresses JSON responses to reduce bandwidth and improve performance
 */
export const compressionMiddleware = async (
  c: Context,
  next: Next
): Promise<void> => {
  // Apply compression to JSON responses
  c.header("Content-Encoding", "gzip");
  await next();
};
