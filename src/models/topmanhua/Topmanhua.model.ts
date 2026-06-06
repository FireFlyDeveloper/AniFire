import axios from "axios";
import * as cheerio from "cheerio";
import BaseModel from "../meta/index";
import { TopmanhuaSearchResult } from "../../../types/topmanhua";

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
}

export default new TopmanhuaModel();
