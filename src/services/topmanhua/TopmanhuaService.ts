import TopmanhuaModel from "../../models/manga/Topmanhua/Topmanhua.model";
import { TopmanhuaSearchResult } from "../../../types/topmanhua";

class TopmanhuaService {
  private model = TopmanhuaModel;

  async search(query: string): Promise<TopmanhuaSearchResult> {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query is required");
    }

    const results = await this.model.search(query);
    return results;
  }
}

export default new TopmanhuaService();
