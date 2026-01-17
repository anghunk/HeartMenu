import type { Context, Next } from 'hono'
import { verify } from '../utils/token'

export default async function admin(c: Context, next: Next) {
  const h = c.req.header('Authorization') || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  if (!token) return c.json({ error: 'unauthorized' }, 401)
  
  const payload = await verify(token, c.env.JWT_SECRET)
  if (!payload) return c.json({ error: 'unauthorized' }, 401)
  
  if (payload.role !== 'admin') return c.json({ error: 'forbidden' }, 403)
  
  c.set('user', payload)
  await next()
}
