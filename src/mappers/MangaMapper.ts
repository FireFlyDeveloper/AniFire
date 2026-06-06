import { AbstractMediaMapper, MapResult } from "./AbstractMediaMapper";
import { TopmanhuaMangaInfo } from "../types/topmanhua";
import AnilistService from "../services/meta/AnilistService";
import TopmanhuaService from "../services/topmanhua/TopmanhuaService";

export class MangaMapper extends AbstractMediaMapper<
  any,
  TopmanhuaMangaInfo
> {
  async search(query: string, type: "ANIME" | "MANGA"): Promise<MapResult<TopmanhuaMangaInfo>[]> {
    if (type !== "MANGA") {
      throw new Error("MangaMapper only supports MANGA type");
    }

    const anilistResults = await AnilistService.getSearchResults(
      query,
      type,
      1,
      10
    );

    const mappedResults: MapResult<TopmanhuaMangaInfo>[] = [];

    for (const anilistItem of anilistResults.items) {
      const searchTerm = anilistItem.title.userPreferred || anilistItem.title.romaji;

      let providerMatch: TopmanhuaMangaInfo | null = null;
      let confidence = 0;

      try {
        const searchResults = await TopmanhuaService.search(searchTerm);

        const providerResults = searchResults.items.map((item) => ({
          title: item.title,
          data: item
        }));

        const bestMatch = this.findBestMatch(searchTerm, providerResults);

        if (bestMatch) {
          const providerItem = bestMatch.match as any;
          confidence = bestMatch.confidence;

          providerMatch = await TopmanhuaService.getInfo(providerItem.id);
        }
      } catch (error) {
        console.warn(`Failed to search Topmanhua for: ${searchTerm}`);
      }

      mappedResults.push({
        anilistData: anilistItem,
        providerData: providerMatch || undefined,
        providerInfo: providerMatch || undefined,
        confidence
      });
    }

    return mappedResults;
  }

  async getInfo(
    identifier: string | number,
    type: "ANIME" | "MANGA"
  ): Promise<MapResult<TopmanhuaMangaInfo>> {
    if (type !== "MANGA") {
      throw new Error("MangaMapper only supports MANGA type");
    }

    const anilistItem = await AnilistService.getMediaById(
      typeof identifier === "number" ? identifier : parseInt(identifier)
    );

    const searchTerm = anilistItem.title.userPreferred || anilistItem.title.romaji;

    let providerMatch: TopmanhuaMangaInfo | null = null;
    let confidence = 0;

    try {
      const searchResults = await TopmanhuaService.search(searchTerm);

      const providerResults = searchResults.items.map((item) => ({
        title: item.title,
        data: item
      }));

      const bestMatch = this.findBestMatch(searchTerm, providerResults);

      if (bestMatch) {
        const providerItem = bestMatch.match as any;
        confidence = bestMatch.confidence;

        providerMatch = await TopmanhuaService.getInfo(providerItem.id);
      }
    } catch (error) {
      console.warn(`Failed to search Topmanhua for: ${searchTerm}`);
    }

    return {
      anilistData: anilistItem,
      providerData: providerMatch || undefined,
      providerInfo: providerMatch || undefined,
      confidence
    };
  }
}
