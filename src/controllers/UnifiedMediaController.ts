import type { Context } from "hono";
import UnifiedMediaService from "../services/UnifiedMediaService";
import { MapResult } from "../mappers/AbstractMediaMapper";
import { TopmanhuaMangaInfo } from "../types/topmanhua";

type AppContext = Context;

export default class UnifiedMediaController {
  private service = UnifiedMediaService;

  async initialize(c: AppContext) {
    try {
      await this.service.initialize();
      
      return c.json({
        success: true,
        message: "Cache services initialized successfully",
      }, 200);
    } catch (err: any) {
      console.error("[UnifiedMediaController] Error:", err);
      return c.json({
        success: false,
        error: "Failed to initialize cache services",
        details: err.message,
      }, 500);
    }
  }

  async getStats(c: AppContext) {
    try {
      const stats = await this.service.getStats();

      return c.json({
        success: true,
        data: stats,
      });
    } catch (err: any) {
      console.error("[UnifiedMediaController] Error:", err);
      return c.json({
        success: false,
        error: "Failed to get cache statistics",
        details: err.message,
      }, 500);
    }
  }

  getAvailableTypes(c: AppContext) {
    return c.json({
      success: true,
      data: {
        availableTypes: this.service.getAvailableTypes()
      }
    });
  }

  async search(c: AppContext) {
    try {
      const query = c.req.query("q");
      const type = c.req.query("type") as "ANIME" | "MANGA" | undefined;

      if (!query) {
        return c.json(
          {
            success: false,
            error: "Search query parameter 'q' is required",
          },
          400
        );
      }

      const results = await this.service.search(query, type);

      return c.json(
        {
          success: true,
          data: results,
        },
        200
      );
    } catch (err: any) {
      console.error("[UnifiedMediaController] Error:", err);
      return c.json(
        {
          success: false,
          error: "Failed to search media",
          details: err.message,
        },
        500
      );
    }
  }

  async getInfo(c: AppContext) {
    try {
      const id = c.req.query("id");
      const type = c.req.query("type") as "ANIME" | "MANGA" | undefined;

      if (!id) {
        return c.json(
          {
            success: false,
            error: "ID parameter 'id' is required",
          },
          400
        );
      }

      const result = await this.service.getInfo(id, type);

      return c.json(
        {
          success: true,
          data: result,
        },
        200
      );
    } catch (err: any) {
      console.error("[UnifiedMediaController] Error:", err);
      return c.json(
        {
          success: false,
          error: "Failed to fetch media info",
          details: err.message,
        },
        500
      );
    }
  }
}
