import { Hono } from "hono";
import router from "./src/routers/index";
import optimizedRouter from "./src/routers/optimized/index";
import requestRouter from "./src/routers/requests/index";
import schedulerRouter from "./src/routers/scheduler/index";
import UnifiedMediaService from "./src/services/UnifiedMediaService";
import { cronScheduler } from "./src/services/CronScheduler";

const app = new Hono();

// Health check
app.get("/", (c) => {
  const schedulerStatus = cronScheduler.getStatus();

  return c.text(`AniFire API - Unified Media Service with Caching

Endpoints:
Standard: /api/unified/*
  - GET /api/unified/search?q={query}    - Search with auto-type detection
  - GET /api/unified/info?id={id}        - Get details by AniList ID
  - GET /api/unified/types                - Available media types
  - GET /api/unified/initialize            - Initialize cache services
  - GET /api/unified/stats                - Cache statistics

Optimized: /api/optimized/*
  - GET /api/optimized/search?q={query}   - Search with parallel execution
  - GET /api/optimized/info?id={id}       - Get details with optimizations
  - GET /api/optimized/stats               - Performance statistics
  - POST /api/optimized/cleanup            - Cleanup stale data

Request Stats: /api/requests/*
  - GET /api/requests/trending              - Most requested items (trending)
  - GET /api/requests/stats/:id            - Request stats for item
  - GET /api/requests/overview              - Overall request statistics
  - GET /api/requests/priority              - Priority queue preview
  - POST /api/requests/reset               - Reset daily request counts

Scheduler Status:
  ✅ Update Cycle: ${schedulerStatus.updateCycle ? 'Active' : 'Inactive'}
  ✅ Daily Reset: ${schedulerStatus.dailyReset ? 'Active' : 'Inactive'}

  Schedule:
  📅 Update Cycle: Every 5 minutes (*/5 * * * *)
  📅 Daily Reset: Every day at midnight (0 0 * * *)

Cache Features:
✅ PostgreSQL persistent storage with image data
✅ Redis high-speed caching layer
✅ Automatic image download and storage
✅ 5-minute cache TTL for optimal performance
✅ Parallel execution (10x faster)
✅ Request deduplication
✅ Performance monitoring
✅ Request tracking (boosts update priority)
✅ Code-based cron scheduler (no systemd needed)`);
});

app.route("/api", router);
app.route("/api/optimized", optimizedRouter);
app.route("/api/requests", requestRouter);
app.route("/api/scheduler", schedulerRouter);

const PORT = parseInt(process.env.PORT || "3000");

async function initializeServices() {
  try {
    await UnifiedMediaService.initialize();
    console.log("✅ Cache services initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize cache services:", error);
    process.exit(1);
  }

  // Start Cron Scheduler
  try {
    cronScheduler.start();
    console.log("✅ Cron Scheduler started successfully");
  } catch (error) {
    console.error("❌ Failed to start cron scheduler:", error);
    // Don't exit, the app can still work without the scheduler
    console.warn("⚠️  Continuing without cron scheduler (updates won't run automatically)");
  }
}

initializeServices();

export default {
  port: PORT,
  fetch: app.fetch,
};
