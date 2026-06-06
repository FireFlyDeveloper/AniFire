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

  async getInfo(id: string): Promise<TopmanhuaMangaInfo> {
    if (!id || id.trim().length === 0) {
      throw new Error("ID is required");
    }

    if (id.includes("/")) {
      throw new Error("Invalid ID format");
    }

    const info = await this.model.fetchInfo(id);
    return info;
  }
}

export default new TopmanhuaService();
