import { Hono } from 'hono'
import { hashPassword, verifyPassword } from '../utils/password'
import { encode, verify, type Payload } from '../utils/token'
import authMiddleware from '../middleware/auth'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  ADMIN_USERNAME?: string
  ADMIN_PASSWORD?: string
}

type Variables = {
  user: Payload
}

const router = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// 后台管理员登录接口
router.post('/admin/login', async (c) => {
  const { username, password } = await c.req.json<{ username: string; password: string }>()
  if (c.env.ADMIN_USERNAME && c.env.ADMIN_PASSWORD && username === c.env.ADMIN_USERNAME && password === c.env.ADMIN_PASSWORD) {
    const token = await encode({ sub: 'admin', username: 'admin', role: 'admin', avatar: 1 }, c.env.JWT_SECRET)
    return c.json({ token })
  }
  return c.json({ error: 'invalid_credentials' }, 401)
})

// 点餐端用户登录接口
router.post('/user/login', async (c) => {
  const { username, password } = await c.req.json<{ username: string; password: string }>()
  const row = await c.env.DB.prepare('SELECT id, username, password_hash, role, avatar FROM users WHERE username = ?').bind(username).first<{ id: number; username: string; password_hash: string; role: string; avatar: number }>()
  if (!row) return c.json({ error: 'invalid_credentials' }, 401)
  // 只允许普通用户登录
  if (row.role !== 'user') return c.json({ error: 'forbidden' }, 403)
  const ok = await verifyPassword(password, row.password_hash)
  if (!ok) return c.json({ error: 'invalid_credentials' }, 401)
  const token = await encode({ sub: row.id, username: row.username, role: row.role, avatar: row.avatar }, c.env.JWT_SECRET)
  return c.json({ token })
})

router.post('/register', async (c) => {
  const { username, password, avatar } = await c.req.json<{ username: string; password: string; avatar?: number }>()
  const auth = c.req.header('Authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return c.json({ error: 'forbidden' }, 403)
  const payload = await verify(token, c.env.JWT_SECRET)
  if (!payload || payload.role !== 'admin') return c.json({ error: 'forbidden' }, 403)
  const exists = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first()
  if (exists) return c.json({ error: 'user_exists' }, 400)
  const password_hash = await hashPassword(password)
  const role = 'user'
  await c.env.DB.prepare('INSERT INTO users (username, password_hash, role, avatar) VALUES (?, ?, ?, ?)').bind(username, password_hash, role, avatar || 1).run()
  return c.json({ ok: true, role })
})

router.get('/me', authMiddleware, async (c) => {
  const user = c.get('user')
  return c.json({ user })
})

export default router
