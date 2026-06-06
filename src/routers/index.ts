import { Hono } from 'hono'
import AnilistRoute from './meta/index'

const router = new Hono()

router.route('/meta', AnilistRoute)

export default router
