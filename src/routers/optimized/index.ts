import { Hono } from "hono";
import { trackRequest } from "../../middleware/track-requests";
import OptimizedMediaController from "../../controllers/OptimizedMediaController";

const router = new Hono();
const controller = OptimizedMediaController;

/**
 * Optimized Unified Media Routes
 * High-performance endpoints with caching, parallel execution, and request deduplication
 */

// Health check
router.get("/", (c) => {
  return c.json({
    service: "AniFire Optimized API",
    version: "3.0.0",
    features: {
      caching: true,
      parallelExecution: true,
      requestDeduplication: true,
      performanceMonitoring: true,
    },
  });
});

// Initialize (optional - caches are initialized automatically on first use)
router.get("/initialize", controller.initialize);

// Cleanup
router.post("/cleanup", controller.cleanup);

// Search endpoint with optimizations
router.get("/search", trackRequest, controller.search);

// Info endpoint with optimizations
router.get("/info/:id", trackRequest, controller.getInfo);

// Statistics
router.get("/stats", controller.stats);

// Available types
router.get("/types", controller.types);

export default router;
