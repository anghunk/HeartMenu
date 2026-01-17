import { Hono } from 'hono'
import auth from '../middleware/auth'

type Bindings = { DB: D1Database }
type Item = { menu_id: number; name: string; qty: number }
type OrderRow = { id: number; items: string; created_at: string }

const router = new Hono<{ Bindings: Bindings }>()

// 提交订单（每次创建一条新订单）
router.post('/', auth, async (c) => {
  const user = c.get('user') as { sub: number }
  const { items } = await c.req.json<{ items: { menu_id: number; qty?: number }[] }>()

  if (!items || !Array.isArray(items) || items.length === 0) {
    return c.json({ error: 'items_required' }, 400)
  }

  // 获取菜品信息并构建订单项
  const orderItems: Item[] = []
  for (const item of items) {
    const menu = await c.env.DB.prepare('SELECT id, name FROM menu_items WHERE id = ?')
      .bind(item.menu_id)
      .first<{ id: number; name: string }>()
    if (!menu) {
      return c.json({ error: 'menu_not_found', menu_id: item.menu_id }, 404)
    }
    orderItems.push({
      menu_id: item.menu_id,
      name: menu.name,
      qty: item.qty && item.qty > 0 ? item.qty : 1
    })
  }

  // 创建新订单
  const payload = JSON.stringify(orderItems)
  const result = await c.env.DB.prepare('INSERT INTO orders (user_id, items) VALUES (?, ?)')
    .bind(user.sub, payload)
    .run()

  return c.json({ ok: true, order_id: result.meta.last_row_id })
})

// 获取订单列表
router.get('/list', auth, async (c) => {
  const user = c.get('user') as { sub: number }
  const res = await c.env.DB.prepare('SELECT id, items, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .bind(user.sub)
    .all<OrderRow>()

  const orders = res.results?.map((row) => ({
    id: row.id,
    items: JSON.parse(row.items) as Item[],
    created_at: row.created_at
  })) || []

  return c.json({ orders })
})

// 获取单个订单详情
router.get('/:id', auth, async (c) => {
  const user = c.get('user') as { sub: number }
  const id = Number(c.req.param('id'))

  const row = await c.env.DB.prepare('SELECT id, items, created_at FROM orders WHERE id = ? AND user_id = ?')
    .bind(id, user.sub)
    .first<OrderRow>()

  if (!row) return c.json({ error: 'order_not_found' }, 404)

  return c.json({
    id: row.id,
    items: JSON.parse(row.items) as Item[],
    created_at: row.created_at
  })
})

// 删除订单
router.delete('/:id', auth, async (c) => {
  const user = c.get('user') as { sub: number }
  const id = Number(c.req.param('id'))

  const existing = await c.env.DB.prepare('SELECT id FROM orders WHERE id = ? AND user_id = ?')
    .bind(id, user.sub)
    .first()

  if (!existing) return c.json({ error: 'order_not_found' }, 404)

  await c.env.DB.prepare('DELETE FROM orders WHERE id = ?').bind(id).run()
  return c.json({ ok: true })
})

export default router
