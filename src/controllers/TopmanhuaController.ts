import type { Context } from "hono";
import TopmanhuaService from "../services/topmanhua/TopmanhuaService";
import { TopmanhuaSearchResult } from "../types/topmanhua";

type AppContext = Context;

export default class TopmanhuaController {
  private service = TopmanhuaService;

  async search(c: AppContext) {
    try {
      const query = c.req.query("q");

      if (!query) {
        return c.json(
          {
            success: false,
            error: "Search query parameter 'q' is required",
          },
          400
        );
      }

      const results = await this.service.search(query);

      return c.json(
        {
          success: true,
          data: results,
        },
        200
      );
    } catch (err: any) {
      console.error("[TopmanhuaController] Error:", err);
      return c.json(
        {
          success: false,
          error: "Failed to search Topmanhua",
          details: err.message,
        },
        500
      );
    }
  }
}
