import { Request, Response } from "express";
import AnilistService from "../..//services/meta/AnilistService";

export default class AnilistController {
  async getHomeFeed(req: Request, res: Response) {
    try {
      const feed = await AnilistService.getHomeFeed();
      res.status(200).json(feed);
    } catch (err: any) {
      console.error("[AniListController] Error:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch AniList feed", details: err.message });
    }
  }
}
