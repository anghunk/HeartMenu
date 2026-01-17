import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './routes/auth'
import menu from './routes/menu'
import order from './routes/order'
import admin from './routes/admin'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => c.json({ ok: true, name: 'couple-menu-api' }))
app.get('/health', (c) => c.text('ok'))

app.route('/auth', auth)
app.route('/menu', menu)
app.route('/order', order)
app.route('/admin', admin)

export default app
