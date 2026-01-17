import { Hono } from 'hono';
import auth from '../middleware/auth';
import type { Payload } from '../utils/token';
import { EmailMessage } from 'cloudflare:email';

type Bindings = { DB: D1Database; SEB?: any; NOTIFY_FROM_ADDRESS?: string };
type Item = { menu_id: number; name: string; qty: number };
type OrderRow = { id: number; items: string; created_at: string };

const router = new Hono<{ Bindings: Bindings }>();

router.post('/', auth, async (c) => {
	const user = c.get('user') as Payload;
	const { items } = await c.req.json<{ items: { menu_id: number; qty?: number }[] }>();

	if (!items || !Array.isArray(items) || items.length === 0) {
		return c.json({ error: 'items_required' }, 400);
	}

	const orderItems: Item[] = [];
	for (const item of items) {
		const menu = await c.env.DB.prepare('SELECT id, name FROM menu_items WHERE id = ?')
			.bind(item.menu_id)
			.first<{ id: number; name: string }>();
		if (!menu) {
			return c.json({ error: 'menu_not_found', menu_id: item.menu_id }, 404);
		}
		orderItems.push({
			menu_id: item.menu_id,
			name: menu.name,
			qty: item.qty && item.qty > 0 ? item.qty : 1,
		});
	}

	const payload = JSON.stringify(orderItems);
	const result = await c.env.DB.prepare('INSERT INTO orders (user_id, items) VALUES (?, ?)')
		.bind(user.sub, payload)
		.run();

	try {
		const row = await c.env.DB.prepare('SELECT value FROM settings WHERE key = ?')
			.bind('order_notify_email')
			.first<{ value: string }>();
		const notifyEmail = row?.value?.trim();
		const sendEmailService = (c.env as any).SEB;
		console.log('notifyEmail:', notifyEmail, 'hasSEB:', !!(sendEmailService && sendEmailService.send));
		if (notifyEmail && sendEmailService && typeof sendEmailService.send === 'function') {
			const fromAddress = (c.env as any).NOTIFY_FROM_ADDRESS || notifyEmail;
			if (fromAddress && typeof fromAddress === 'string' && fromAddress.includes('@')) {
				const userName = user.username || `用户${user.sub}`;
				const createdAt = new Date().toLocaleString('zh-CN', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
				});
				const itemsHtml = orderItems
					.map(
						(item) =>
							`<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.name}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">x${item.qty}</td></tr>`,
					)
					.join('');
				const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>新订单提醒</title>
  <style>
    body { background-color:#f5f5f7; margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif; }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="background-color:#f5f5f7;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.08);">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #f1f5f9;background:linear-gradient(135deg,#f97373,#fb7185);color:#ffffff;">
              <div style="font-size:18px;font-weight:600;">情侣点餐 · 新订单提醒</div>
              <div style="font-size:12px;opacity:0.9;margin-top:4px;">HeartMenu 点餐小应用</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <div style="font-size:14px;color:#0f172a;margin-bottom:12px;">你好，</div>
              <div style="font-size:14px;color:#0f172a;margin-bottom:4px;">有一笔新的订单已提交：</div>
              <ul style="padding-left:18px;margin:8px 0 16px 0;font-size:13px;color:#475569;">
                <li>下单用户：<strong>${userName}</strong> (ID: ${user.sub})</li>
                <li>订单编号：<strong>#${result.meta.last_row_id}</strong></li>
                <li>下单时间：<strong>${createdAt}</strong></li>
              </ul>
              <div style="font-size:13px;color:#0f172a;font-weight:600;margin-bottom:8px;">点餐明细</div>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;border-radius:8px;overflow:hidden;background-color:#f8fafc;">
                <thead>
                  <tr>
                    <th align="left" style="padding:8px 12px;background-color:#e2e8f0;font-size:12px;color:#475569;font-weight:600;">菜品</th>
                    <th align="right" style="padding:8px 12px;background-color:#e2e8f0;font-size:12px;color:#475569;font-weight:600;">数量</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <div style="font-size:12px;color:#94a3b8;margin-top:16px;">
                这是一封系统自动通知邮件，请勿直接回复。
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;text-align:center;">
              HeartMenu · 情侣点餐小应用
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
				const lines: string[] = [];
				const domain = fromAddress.split('@')[1] || 'localhost';
				const messageId = `<order-${result.meta.last_row_id}-${Date.now()}@${domain}>`;
				lines.push(`From: "HeartMenu" <${fromAddress}>`);
				lines.push(`To: ${notifyEmail}`);
				lines.push(`Message-ID: ${messageId}`);
				lines.push('Subject: 新订单提醒');
				lines.push('Content-Type: text/html; charset="utf-8"');
				lines.push('');
				for (const line of html.split('\n')) {
					lines.push(line);
				}
				const raw = lines.join('\r\n');
				const message = new EmailMessage(fromAddress, notifyEmail, raw);
				await sendEmailService.send(message);
			}
		}
	} catch (e) {
		console.error('发送订单通知邮件失败', e);
	}

	return c.json({ ok: true, order_id: result.meta.last_row_id });
});

// 获取订单列表
router.get('/list', auth, async (c) => {
	const user = c.get('user') as { sub: number };
	const res = await c.env.DB.prepare(
		'SELECT id, items, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
	)
		.bind(user.sub)
		.all<OrderRow>();

	const orders =
		res.results?.map((row) => ({
			id: row.id,
			items: JSON.parse(row.items) as Item[],
			created_at: row.created_at,
		})) || [];

	return c.json({ orders });
});

// 获取单个订单详情
router.get('/:id', auth, async (c) => {
	const user = c.get('user') as { sub: number };
	const id = Number(c.req.param('id'));

	const row = await c.env.DB.prepare('SELECT id, items, created_at FROM orders WHERE id = ? AND user_id = ?')
		.bind(id, user.sub)
		.first<OrderRow>();

	if (!row) return c.json({ error: 'order_not_found' }, 404);

	return c.json({
		id: row.id,
		items: JSON.parse(row.items) as Item[],
		created_at: row.created_at,
	});
});

// 删除订单
router.delete('/:id', auth, async (c) => {
	const user = c.get('user') as { sub: number };
	const id = Number(c.req.param('id'));

	const existing = await c.env.DB.prepare('SELECT id FROM orders WHERE id = ? AND user_id = ?')
		.bind(id, user.sub)
		.first();

	if (!existing) return c.json({ error: 'order_not_found' }, 404);

	await c.env.DB.prepare('DELETE FROM orders WHERE id = ?').bind(id).run();
	return c.json({ ok: true });
});

export default router;
