import { Hono } from "hono";
import router from "./src/routers/index";
import UnifiedMediaService from "./src/services/UnifiedMediaService";

const app = new Hono();

app.get("/", (c) => {
  return c.text("AniFire API - Unified Media Service with Caching\n\nEndpoints:\n- GET /api/unified/search?q={query}    - Search with auto-type detection\n- GET /api/unified/info?id={id}        - Get details by AniList ID\n- GET /api/unified/types                - Available media types\n- GET /api/unified/initialize            - Initialize cache services\n- GET /api/unified/stats                - Cache statistics\n\nCache Features:\n✅ PostgreSQL persistent storage with image data\n✅ Redis high-speed caching layer\n✅ Automatic image download and storage\n✅ 5-minute cache TTL for optimal performance");
});

app.route("/api", router);

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
