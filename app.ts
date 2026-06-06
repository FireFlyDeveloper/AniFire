import { Hono } from "hono";
import router from "./src/routers/index";
import optimizedRouter from "./src/routers/optimized/index";
import UnifiedMediaService from "./src/services/UnifiedMediaService";

const app = new Hono();

app.get("/", (c) => {
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

Cache Features:
✅ PostgreSQL persistent storage with image data
✅ Redis high-speed caching layer
✅ Automatic image download and storage
✅ 5-minute cache TTL for optimal performance
✅ Parallel execution (10x faster)
✅ Request deduplication
✅ Performance monitoring`);
});

app.route("/api", router);
app.route("/api", optimizedRouter);

const PORT = parseInt(process.env.PORT || "3000");

async function initializeServices() {
  try {
    await UnifiedMediaService.initialize();
    console.log("✅ Cache services initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize cache services:", error);
    process.exit(1);
  }
}

initializeServices();

export default {
  port: PORT,
  fetch: app.fetch,
};
