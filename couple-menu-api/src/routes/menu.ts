import { Hono } from 'hono'
import admin from '../middleware/admin'
import auth from '../middleware/auth'

type Bindings = { DB: D1Database }

const router = new Hono<{ Bindings: Bindings }>()

router.get('/', auth, async (c) => {
  const res = await c.env.DB.prepare('SELECT id, name, desc, image, created_at FROM menu_items ORDER BY id DESC').all()
  return c.json({ items: res.results })
})

router.post('/', admin, async (c) => {
  const { name, desc, image } = await c.req.json<{ name: string; desc?: string; image?: string }>()
  await c.env.DB.prepare('INSERT INTO menu_items (name, desc, image) VALUES (?, ?, ?)').bind(name, desc || null, image || null).run()
  return c.json({ ok: true })
})

router.put('/:id', admin, async (c) => {
  const id = Number(c.req.param('id'))
  const { name, desc, image } = await c.req.json<{ name?: string; desc?: string; image?: string }>()
  const existing = await c.env.DB.prepare('SELECT id FROM menu_items WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ error: 'not_found' }, 404)
  const row = await c.env.DB.prepare('SELECT name, desc, image FROM menu_items WHERE id = ?').bind(id).first<{ name: string; desc: string | null; image: string | null }>()
  const n = name ?? row?.name
  const d = typeof desc !== 'undefined' ? desc : row?.desc
  const i = typeof image !== 'undefined' ? image : row?.image
  await c.env.DB.prepare('UPDATE menu_items SET name = ?, desc = ?, image = ? WHERE id = ?').bind(n, d, i, id).run()
  return c.json({ ok: true })
})

router.delete('/:id', admin, async (c) => {
  const id = Number(c.req.param('id'))
  const existing = await c.env.DB.prepare('SELECT id FROM menu_items WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ error: 'not_found' }, 404)
  await c.env.DB.prepare('DELETE FROM menu_items WHERE id = ?').bind(id).run()
  return c.json({ ok: true })
})

export default router
