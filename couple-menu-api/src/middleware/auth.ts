import { verify, type Payload } from '../utils/token'
import type { Context, Next } from 'hono'

export default async function auth(c: Context<{ Bindings: { JWT_SECRET: string }; Variables: { user: Payload } }>, next: Next) {
  const h = c.req.header('Authorization') || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  if (!token) return c.json({ error: 'unauthorized' }, 401)
  const payload = await verify(token, c.env.JWT_SECRET)
  if (!payload) return c.json({ error: 'unauthorized' }, 401)
  c.set('user', payload)
  await next()
}
