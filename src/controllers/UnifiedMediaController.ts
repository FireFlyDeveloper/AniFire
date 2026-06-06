import type { Context } from "hono";
import UnifiedMediaService from "../services/UnifiedMediaService";
import { MapResult } from "../mappers/AbstractMediaMapper";

type AppContext = Context;

export default class UnifiedMediaController {
  private service = UnifiedMediaService;

  async search(c: AppContext) {
    try {
      const query = c.req.query("q");
      const type = c.req.query("type") as "ANIME" | "MANGA";

      if (!query) {
        return c.json(
          {
            success: false,
            error: "Search query parameter 'q' is required",
          },
          400
        );
      }

      if (!type || (type !== "ANIME" && type !== "MANGA")) {
        return c.json(
          {
            success: false,
            error: "Invalid or missing parameter: type (must be ANIME or MANGA)",
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
      const type = c.req.query("type") as "ANIME" | "MANGA";

      if (!id) {
        return c.json(
          {
            success: false,
            error: "ID parameter 'id' is required",
          },
          400
        );
      }

      if (!type || (type !== "ANIME" && type !== "MANGA")) {
        return c.json(
          {
            success: false,
            error: "Invalid or missing parameter: type (must be ANIME or MANGA)",
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
