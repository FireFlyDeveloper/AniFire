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

  async search(c: AppContext) {
    try {
      const search = c.req.query('search')
      const type = c.req.query('type') as 'ANIME' | 'MANGA' | undefined
      const page = parseInt(c.req.query('page') || '1')
      const perPage = parseInt(c.req.query('perPage') || '20')

      if (!search) {
        return c.json(
          { error: 'Missing required parameter: search' },
          400
        )
      }

      if (!type || (type !== 'ANIME' && type !== 'MANGA')) {
        return c.json(
          { error: 'Invalid or missing parameter: type (must be ANIME or MANGA)' },
          400
        )
      }

      if (page < 1) {
        return c.json(
          { error: 'Invalid parameter: page must be greater than 0' },
          400
        )
      }

      if (perPage < 1 || perPage > 50) {
        return c.json(
          { error: 'Invalid parameter: perPage must be between 1 and 50' },
          400
        )
      }

      const results = await AnilistService.getSearchResults(search, type, page, perPage)
      return c.json(results, 200)
    } catch (err: any) {
      console.error('[AniListController] Error:', err)
      return c.json(
        { error: 'Failed to fetch search results', details: err.message },
        500
      )
    }
  }

  async getById(c: AppContext) {
    try {
      const idParam = c.req.param('id')
      const id = parseInt(idParam || '')

      if (!idParam || isNaN(id) || id <= 0) {
        return c.json(
          { error: 'Missing or invalid parameter: id (must be a positive integer)' },
          400
        )
      }

      const media = await AnilistService.getMediaById(id)
      return c.json(media, 200)
    } catch (err: any) {
      console.error('[AniListController] Error:', err)
      return c.json(
        { error: 'Failed to fetch media by ID', details: err.message },
        500
      )
    }
  }
}
