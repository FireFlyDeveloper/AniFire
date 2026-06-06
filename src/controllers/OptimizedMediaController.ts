import OptimizedMediaService from "../services/OptimizedMediaService";

/**
 * Optimized Media Controller
 * Handles HTTP requests with performance optimizations
 */
export class OptimizedMediaController {
  /**
   * Search for media with optimizations
   */
  async search(c: any): Promise<Response> {
    const query = c.req.query("q");
    const type = c.req.query("type") as "ANIME" | "MANGA" | undefined;

    validation:
    if (!query || query.trim().length === 0) {
      return c.json({ error: "Search query is required" }, 400);
    }

    try {
      const results = await OptimizedMediaService.search(query, type);

      return c.json({
        query,
        type: type || "auto",
        results,
        count: results.length,
      });
    } catch (error) {
      console.error("Failed to search media:", error);
      return c.json(
        {
          error: "Failed to search media",
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }

  /**
   * Get media information with optimizations
   */
  async getInfo(c: any): Promise<Response> {
    const id = c.req.param("id");
    const type = c.req.query("type") as "ANIME" | "MANGA" | undefined;

    if (!id) {
      return c.json({ error: "Media ID is required" }, 400);
    }

    try {
      const result = await OptimizedMediaService.getInfo(id, type);

      return c.json({
        id,
        type: type || "auto",
        result,
      });
    } catch (error) {
      console.error("Failed to get media info:", error);
      return c.json(
        {
          error: "Failed to get media info",
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }

  /**
   * Get cache and performance statistics
   */
  async stats(c: any): Promise<Response> {
    try {
      const stats = await OptimizedMediaService.getStats();

      return c.json(stats);
    } catch (error) {
      console.error("Failed to get stats:", error);
      return c.json(
        {
          error: "Failed to get statistics",
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }

  /**
   * Get available types
   */
  async types(c: any): Promise<Response> {
    try {
      const types = OptimizedMediaService.getAvailableTypes();

      return c.json({ types });
    } catch (error) {
      console.error("Failed to get types:", error);
      return c.json(
        {
          error: "Failed to get available types",
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }

  /**
   * Initialize cache services
   */
  async initialize(c: any): Promise<Response> {
    try {
      await OptimizedMediaService.initialize();

      return c.json({ message: "Services initialized successfully" });
    } catch (error) {
      console.error("Failed to initialize services:", error);
      return c.json(
        {
          error: "Failed to initialize services",
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }

  /**
   * Cleanup stale data
   */
  async cleanup(c: any): Promise<Response> {
    try {
      await OptimizedMediaService.cleanup();

      return c.json({ message: "Cleanup completed successfully" });
    } catch (error) {
      console.error("Failed to cleanup:", error);
      return c.json(
        {
          error: "Failed to cleanup",
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }
}

export default new OptimizedMediaController();
