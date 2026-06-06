import { Hono } from 'hono'
import AnilistController from '../../controllers/meta/AnilistController'

const router = new Hono()
const controller = new AnilistController()

router.get('/home', controller.getHomeFeed.bind(controller))
router.get('/search', controller.search.bind(controller))
router.get('/info/:id', controller.getById.bind(controller))

export default router
