import { MapResult } from "../mappers/AbstractMediaMapper";
import { MangaMapper } from "../mappers/MangaMapper";
import { TopmanhuaMangaInfo } from "../types/topmanhua";

export class UnifiedMediaService {
  private mappers = {
    MANGA: new MangaMapper(),
    ANIME: null
  };

  async search(
    query: string,
    type: "ANIME" | "MANGA"
  ): Promise<MapResult<TopmanhuaMangaInfo>[]> {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query is required");
    }

    const mapper = this.mappers[type];
    if (!mapper) {
      throw new Error(`${type} provider is not yet implemented`);
    }

    return mapper.search(query, type);
  }

  async getInfo(
    identifier: string | number,
    type: "ANIME" | "MANGA"
  ): Promise<MapResult<TopmanhuaMangaInfo>> {
    if (!identifier) {
      throw new Error("Identifier is required");
    }

    const mapper = this.mappers[type];
    if (!mapper) {
      throw new Error(`${type} provider is not yet implemented`);
    }

    return mapper.getInfo(identifier, type);
  }
}

export default new UnifiedMediaService();
