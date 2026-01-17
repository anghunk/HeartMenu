import { Hono } from 'hono';
import admin from '../middleware/admin';
import { hashPassword } from '../utils/password';
import {
	testR2Connection,
	uploadToR2,
	generateFileName,
	isValidImageType,
	MAX_FILE_SIZE,
	type R2Config,
} from '../utils/r2';

type Bindings = { DB: D1Database; JWT_SECRET: string };

type R2ConfigRow = {
	id: number;
	account_id: string;
	access_key_id: string;
	secret_access_key: string;
	bucket_name: string;
	custom_domain: string;
	region: string;
	created_at: string;
	updated_at: string;
};

const router = new Hono<{ Bindings: Bindings }>();

router.get('/orders', admin, async (c) => {
	const res = await c.env.DB.prepare(
		'SELECT o.id, o.user_id, u.username, o.items, o.created_at FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC',
	).all();
	return c.json({ success: true, data: res.results, error: null });
});

router.get('/users', admin, async (c) => {
	const res = await c.env.DB.prepare('SELECT id, username, role, avatar, created_at FROM users ORDER BY id DESC').all();
	return c.json({ users: res.results });
});

router.patch('/users/:id', admin, async (c) => {
	const id = Number(c.req.param('id'));
	const { username, password, avatar } = await c.req.json<{ username?: string; password?: string; avatar?: number }>();
	if (!username && !password && !avatar) return c.json({ error: 'nothing to update' }, 400);
	const existing = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(id).first();
	if (!existing) return c.json({ error: 'not_found' }, 404);
	if (username) {
		const exists = await c.env.DB.prepare('SELECT id FROM users WHERE username = ? AND id != ?')
			.bind(username, id)
			.first();
		if (exists) return c.json({ error: 'username_exists' }, 400);
	}
	const fields: string[] = [];
	const values: (string | number)[] = [];
	if (username) {
		fields.push('username = ?');
		values.push(username);
	}
	if (password) {
		fields.push('password_hash = ?');
		values.push(await hashPassword(password));
	}
	if (avatar) {
		fields.push('avatar = ?');
		values.push(avatar);
	}
	values.push(id);
	const stmt = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
	await c.env.DB.prepare(stmt)
		.bind(...values)
		.run();
	return c.json({ ok: true });
});

router.delete('/users/:id', admin, async (c) => {
	const id = Number(c.req.param('id'));
	const existing = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(id).first();
	if (!existing) return c.json({ error: 'not_found' }, 404);
	await c.env.DB.prepare('DELETE FROM orders WHERE user_id = ?').bind(id).run();
	await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
	return c.json({ ok: true });
});

// ==================== R2 配置接口 ====================

// 获取 R2 配置
router.get('/settings/r2', admin, async (c) => {
	const row = await c.env.DB.prepare(
		'SELECT account_id, bucket_name, custom_domain, region, access_key_id FROM r2_config ORDER BY id DESC LIMIT 1',
	).first<R2ConfigRow>();

	if (!row) {
		return c.json({
			config: {
				accountId: '',
				bucketName: '',
				customDomain: '',
				region: 'auto',
				hasAccessKey: false,
				configured: false,
			},
		});
	}

	return c.json({
		config: {
			accountId: row.account_id,
			bucketName: row.bucket_name,
			customDomain: row.custom_domain || '',
			region: row.region || 'auto',
			hasAccessKey: !!row.access_key_id,
			configured: !!(row.account_id && row.bucket_name && row.access_key_id),
		},
	});
});

// 保存 R2 配置
router.post('/settings/r2', admin, async (c) => {
	const body = await c.req.json<{
		accountId: string;
		accessKeyId?: string;
		secretAccessKey?: string;
		bucketName: string;
		customDomain?: string;
		region?: string;
	}>();

	const { accountId, accessKeyId, secretAccessKey, bucketName, customDomain, region } = body;

	// 验证必填字段
	if (!accountId || !bucketName) {
		return c.json({ error: '缺少必填字段' }, 400);
	}

	// 检查是否已有配置
	const existing = await c.env.DB.prepare(
		'SELECT id, access_key_id, secret_access_key FROM r2_config ORDER BY id DESC LIMIT 1',
	).first<R2ConfigRow>();

	if (existing) {
		// 更新配置
		const newAccessKeyId = accessKeyId || existing.access_key_id;
		const newSecretAccessKey = secretAccessKey || existing.secret_access_key;

		await c.env.DB.prepare(
			`UPDATE r2_config SET 
        account_id = ?, 
        access_key_id = ?, 
        secret_access_key = ?, 
        bucket_name = ?, 
        custom_domain = ?, 
        region = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
		)
			.bind(
				accountId,
				newAccessKeyId,
				newSecretAccessKey,
				bucketName,
				customDomain || '',
				region || 'auto',
				existing.id,
			)
			.run();
	} else {
		// 首次配置必须提供密钥
		if (!accessKeyId || !secretAccessKey) {
			return c.json({ error: '首次配置必须提供访问密钥' }, 400);
		}

		await c.env.DB.prepare(
			`INSERT INTO r2_config (account_id, access_key_id, secret_access_key, bucket_name, custom_domain, region) 
       VALUES (?, ?, ?, ?, ?, ?)`,
		)
			.bind(accountId, accessKeyId, secretAccessKey, bucketName, customDomain || '', region || 'auto')
			.run();
	}

	return c.json({ ok: true });
});

// 测试 R2 连接
router.post('/settings/r2/test', admin, async (c) => {
	const row = await c.env.DB.prepare(
		'SELECT account_id, access_key_id, secret_access_key, bucket_name, region FROM r2_config ORDER BY id DESC LIMIT 1',
	).first<R2ConfigRow>();

	if (!row || !row.access_key_id || !row.secret_access_key) {
		return c.json({ success: false, error: 'R2 存储未配置，请先配置' }, 400);
	}

	const config: R2Config = {
		accountId: row.account_id,
		accessKeyId: row.access_key_id,
		secretAccessKey: row.secret_access_key,
		bucketName: row.bucket_name,
		region: row.region || 'auto',
	};

	const result = await testR2Connection(config);

	if (result.success) {
		return c.json({ success: true, message: '连接成功' });
	} else {
		return c.json({ success: false, error: result.error || '无法连接到 R2 存储桶，请检查配置' });
	}
});

// 上传图片到 R2
router.post('/upload', admin, async (c) => {
	// 获取 R2 配置
	const row = await c.env.DB.prepare(
		'SELECT account_id, access_key_id, secret_access_key, bucket_name, custom_domain, region FROM r2_config ORDER BY id DESC LIMIT 1',
	).first<R2ConfigRow>();

	if (!row || !row.access_key_id || !row.secret_access_key) {
		return c.json({ error: 'R2 存储未配置，请先在系统设置中配置' }, 500);
	}

	// 解析 multipart/form-data
	const formData = await c.req.formData();
	const file = formData.get('file');

	if (!file || !(file instanceof File)) {
		return c.json({ error: '请选择要上传的文件' }, 400);
	}

	// 验证文件类型
	if (!isValidImageType(file.type)) {
		return c.json({ error: '文件类型不支持，仅支持 jpg/png/gif/webp 格式' }, 400);
	}

	// 验证文件大小
	if (file.size > MAX_FILE_SIZE) {
		return c.json({ error: '文件大小超过限制（最大 5MB）' }, 400);
	}

	// 读取文件内容
	const buffer = await file.arrayBuffer();

	// 生成唯一文件名
	const key = generateFileName(file.name);

	// 构建配置
	const config: R2Config = {
		accountId: row.account_id,
		accessKeyId: row.access_key_id,
		secretAccessKey: row.secret_access_key,
		bucketName: row.bucket_name,
		customDomain: row.custom_domain || undefined,
		region: row.region || 'auto',
	};

	// 上传到 R2
	const result = await uploadToR2(config, buffer, key, file.type);

	if (result.success) {
		return c.json({ ok: true, url: result.url, key });
	} else {
		return c.json({ error: result.error || '上传失败' }, 500);
	}
});

router.get('/settings/notify-email', admin, async (c) => {
	const row = await c.env.DB.prepare('SELECT value FROM settings WHERE key = ?')
		.bind('order_notify_email')
		.first<{ value: string }>();
	return c.json({ email: row?.value || '' });
});

router.post('/settings/notify-email', admin, async (c) => {
	const body = await c.req.json<{ email?: string }>();
	const rawEmail = body.email || '';
	const email = rawEmail.trim();

	if (!email) {
		await c.env.DB.prepare('DELETE FROM settings WHERE key = ?').bind('order_notify_email').run();
		return c.json({ ok: true, email: '' });
	}

	const stmt = 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value';
	await c.env.DB.prepare(stmt).bind('order_notify_email', email).run();

	return c.json({ ok: true, email });
});

export default router;
