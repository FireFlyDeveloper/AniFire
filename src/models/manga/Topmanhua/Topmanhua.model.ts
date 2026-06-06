import axios from "axios";
import * as cheerio from "cheerio";
import BaseModel from "../../meta/index";
import { TopmanhuaSearchResult, TopmanhuaMangaInfo } from "../../../../types/topmanhua";

class TopmanhuaModel extends BaseModel {
  url = "https://www.topmanhua.fan";
  name = "Topmanhua";

  async search(query: string): Promise<TopmanhuaSearchResult> {
    try {
      const { data } = await axios.get(
        `${this.url}/?s=${query}&post_type=wp-manga`
      );

      const $ = cheerio.load(data);

      const items = $(".tab-content-wrap .c-tabs-item__content")
        .map((_, el) => ({
          title: $(el).find(".post-title a").text().trim(),
          url: $(el).find(".post-title a").attr("href") || "",
        }))
        .get();

      return {
        items,
      };
    } catch (error) {
      console.error("Topmanhua search failed:", error);
      throw error;
    }
  }

  async fetchInfo(url: string): Promise<TopmanhuaMangaInfo> {
    try {
      const { data } = await axios.get(url);

      const $ = cheerio.load(data);

      const getSummaryContent = (headingText: string) => {
        return $(".post-content_item")
          .filter(
            (_, el) =>
              $(el).find(".summary-heading h5").text().trim() === headingText
          )
          .find(".summary-content")
          .text()
          .trim();
      };

      const alternative = getSummaryContent("Alternative");

      const genres: string[] = [];
      $(".genres-content a").each((_, el) => {
        genres.push($(el).text().trim());
      });

      const release = getSummaryContent("Release");

      const chapters: { name: string; url: string }[] = [];
      $(".wp-manga-chapter a").each((_, el) => {
        chapters.push({
          name: $(el).text().trim(),
          url: $(el).attr("href") || "",
        });
      });

      const mangaData: TopmanhuaMangaInfo = {
        alternative,
        genres,
        release,
        totalChapters: chapters.length,
        chapters,
      };

      return mangaData;
    } catch (error) {
      console.error("Topmanhua info fetch failed:", error);
      throw error;
    }
  }
}

export default new TopmanhuaModel();
