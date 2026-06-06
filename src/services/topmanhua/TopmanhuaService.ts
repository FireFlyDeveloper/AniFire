import TopmanhuaModel from "../../models/manga/Topmanhua/Topmanhua.model";
import {
  TopmanhuaSearchResult,
  TopmanhuaMangaInfo,
} from "../../types/topmanhua";

class TopmanhuaService {
  private model = TopmanhuaModel;

  async search(query: string): Promise<TopmanhuaSearchResult> {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query is required");
    }

    const results = await this.model.search(query);
    return results;
  }

  async getInfo(url: string): Promise<TopmanhuaMangaInfo> {
    if (!url || url.trim().length === 0) {
      throw new Error("URL is required");
    }

    if (!url.startsWith("http")) {
      throw new Error("Invalid URL format");
    }

    const info = await this.model.fetchInfo(url);
    return info;
  }
}

export default new TopmanhuaService();
