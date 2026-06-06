import { Hono } from 'hono'
import router from './src/routers/index'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello, World!')
})

app.route('/api', router)

const PORT = parseInt(process.env.PORT || '3000')

export default {
  port: PORT,
  fetch: app.fetch,
}
