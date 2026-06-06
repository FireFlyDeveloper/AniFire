import type { Context } from 'hono'
import AnilistService from '../..//services/meta/AnilistService'

type AppContext = Context

export default class AnilistController {
  async getHomeFeed(c: AppContext) {
    try {
      const feed = await AnilistService.getHomeFeed()
      return c.json(feed, 200)
    } catch (err: any) {
      console.error('[AniListController] Error:', err)
      return c.json(
        { error: 'Failed to fetch AniList feed', details: err.message },
        500
      )
    }
  }
}
