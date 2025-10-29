import AnilistModel from "../../models/meta/AnilistModel";

class AnilistService {
  async getHomeFeed() {
    const data = await AnilistModel.fetchHomeFeed();

    return {
      anime: data.anime,
      manga: data.manga,
      manhwa: data.manhwa,
      novels: data.novels,
    };
  }
}

export default new AnilistService();
