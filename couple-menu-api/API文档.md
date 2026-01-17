# 📄 情侣点餐小游戏 API 文档

## 🧩 通用说明

- **认证方式**：`Bearer Token`（JWT），在请求头中携带：

```
Authorization: Bearer <token>
```

- 登录接口直接返回 token，之后所有需要认证的接口必须带 token 才能访问
- 管理端接口要求 `role=admin` 用户

---

## 1. 认证与用户管理

### 1.1 管理员登录

```
POST /auth/admin/login
```

**请求参数**

```json
{
	"username": "admin",
	"password": "123456"
}
```

**响应示例**

```json
{
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**错误响应**

```json
{
	"error": "invalid_credentials"
}
```

> 注意：管理员账号通过环境变量 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 配置。

---

### 1.2 用户登录（点餐端）

```
POST /auth/user/login
```

**请求参数**

```json
{
	"username": "alice",
	"password": "123456"
}
```

**响应示例**

```json
{
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**错误响应**

| HTTP 状态码 | 错误信息 | 说明 |
|-------------|----------|------|
| `401` | `invalid_credentials` | 用户名或密码错误 |
| `403` | `forbidden` | 非普通用户不允许登录 |

> 注意：此接口仅允许 `role=user` 的普通用户登录。

---

### 1.3 管理员注册用户（需管理员）

```
POST /auth/register
```

**请求参数**

```json
{
	"username": "bob",
	"password": "123456",
	"avatar": 1
}
```

- `avatar` (可选): 数字类型，默认为 `1`

**响应示例**

```json
{
	"ok": true,
	"role": "user"
}
```

---

### 1.4 获取当前登录用户信息

```
GET /auth/me
```

**响应示例**

```json
{
	"user": {
		"sub": 2,
		"username": "alice",
		"role": "user",
		"avatar": 1
	}
}
```

---

### 1.5 获取用户列表（管理员）

```
GET /admin/users
```

**响应示例**

```json
{
	"users": [
		{
			"id": 1,
			"username": "admin",
			"role": "admin",
			"avatar": 1,
			"created_at": "2024-06-01T12:00:00Z"
		},
		{
			"id": 2,
			"username": "alice",
			"role": "user",
			"avatar": 2,
			"created_at": "2024-06-01T12:10:00Z"
		}
	]
}
```

---

### 1.6 更新用户信息（管理员）

```
PATCH /admin/users/:id
```

**请求参数**

```json
{
	"username": "alice_new",
	"password": "new_password",
	"avatar": 3
}
```

- `username` (可选)
- `password` (可选)
- `avatar` (可选)

**响应示例**

```json
{
	"ok": true
}
```

---

### 1.7 删除用户（管理员）

```
DELETE /admin/users/:id
```

**响应示例**

```json
{
	"ok": true
}
```

---

## 2. 菜单管理

### 2.1 获取菜品列表（所有登录用户可用）

```
GET /menu
```

**响应示例**

```json
{
	"items": [
		{
			"id": 1,
			"name": "咖喱鸡饭",
			"desc": "香浓咖喱配鸡肉",
			"image": "https://cdn.example.com/curry.jpg"
		},
		{
			"id": 2,
			"name": "牛肉拉面",
			"desc": "汤头浓郁，筋道面条",
			"image": "https://cdn.example.com/noodles.jpg"
		}
	]
}
```

---

### 2.2 添加菜品（管理员）

```
POST /menu
```

**请求参数**

```json
{
	"name": "炸鸡块",
	"desc": "金黄酥脆",
	"image": "https://cdn.example.com/fried.jpg"
}
```

- `name` (必填): 菜品名称
- `desc` (可选): 菜品描述
- `image` (可选): 图片 URL

**响应示例**

```json
{
	"ok": true
}
```

---

### 2.3 修改菜品（管理员）

```
PUT /menu/:id
```

**请求参数**

```json
{
	"name": "蜜汁炸鸡块",
	"desc": "香甜酥脆",
	"image": "https://cdn.example.com/honey-fried.jpg"
}
```

- `name` (可选): 菜品名称
- `desc` (可选): 菜品描述
- `image` (可选): 图片 URL

**响应示例**

```json
{
	"ok": true
}
```

---

### 2.4 删除菜品（管理员）

```
DELETE /menu/:id
```

**响应示例**

```json
{
	"ok": true
}
```

---

## 3. 订单管理

### 3.1 提交订单

```
POST /order
```

每次提交都会创建一条新订单。

**请求参数**

```json
{
	"items": [
		{ "menu_id": 1, "qty": 1 },
		{ "menu_id": 2, "qty": 2 }
	]
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `items` | array | 是 | 订单项数组 |
| `items[].menu_id` | number | 是 | 菜品 ID |
| `items[].qty` | number | 否 | 数量，默认 1 |

**响应示例**

```json
{
	"ok": true,
	"order_id": 10
}
```

**错误响应**

```json
{
	"error": "items_required"
}
```

```json
{
	"error": "menu_not_found",
	"menu_id": 999
}
```

---

### 3.2 获取订单列表

```
GET /order/list
```

**响应示例**

```json
{
	"orders": [
		{
			"id": 10,
			"items": [
				{ "menu_id": 1, "name": "咖喱鸡饭", "qty": 1 },
				{ "menu_id": 2, "name": "牛肉拉面", "qty": 2 }
			],
			"created_at": "2024-06-01T12:00:00Z"
		},
		{
			"id": 9,
			"items": [
				{ "menu_id": 3, "name": "炸鸡块", "qty": 1 }
			],
			"created_at": "2024-06-01T11:30:00Z"
		}
	]
}
```

---

### 3.3 获取订单详情

```
GET /order/:id
```

**响应示例**

```json
{
	"id": 10,
	"items": [
		{ "menu_id": 1, "name": "咖喱鸡饭", "qty": 1 },
		{ "menu_id": 2, "name": "牛肉拉面", "qty": 2 }
	],
	"created_at": "2024-06-01T12:00:00Z"
}
```

**错误响应**

```json
{
	"error": "order_not_found"
}
```

---

### 3.4 删除订单

```
DELETE /order/:id
```

**响应示例**

```json
{
	"ok": true
}
```

**错误响应**

```json
{
	"error": "order_not_found"
}
```

---

## 4. 管理员订单查看

### 4.1 获取所有订单记录

```
GET /admin/orders
```

**响应示例**

```json
{
	"success": true,
	"data": [
		{
			"id": 10,
			"user_id": 2,
			"items": [{ "id": 1, "name": "咖喱鸡饭", "qty": 1 }],
			"created_at": "2024-06-01T12:00:00Z"
		},
		{
			"id": 11,
			"user_id": 3,
			"items": [{ "id": 3, "name": "炸鸡块", "qty": 2 }],
			"created_at": "2024-06-01T12:10:00Z"
		}
	],
	"error": null
}
```

---

## 5. R2 存储管理

### 5.1 获取 R2 配置（管理员）

```
GET /admin/settings/r2
```

**响应示例**

```json
{
	"config": {
		"accountId": "abc123xxx",
		"bucketName": "my-bucket",
		"customDomain": "https://cdn.example.com",
		"region": "auto",
		"hasAccessKey": true,
		"configured": true
	}
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `accountId` | string | Cloudflare Account ID |
| `bucketName` | string | 存储桶名称 |
| `customDomain` | string | 自定义域名 |
| `region` | string | 区域 |
| `hasAccessKey` | boolean | 是否已配置访问密钥（不返回实际密钥） |
| `configured` | boolean | 配置是否完整 |

> 注意：出于安全考虑，**不返回** `accessKeyId` 和 `secretAccessKey` 的实际值。

---

### 5.2 保存 R2 配置（管理员）

```
POST /admin/settings/r2
```

**请求参数**

```json
{
	"accountId": "abc123xxx",
	"accessKeyId": "your-access-key-id",
	"secretAccessKey": "your-secret-access-key",
	"bucketName": "my-bucket",
	"customDomain": "https://cdn.example.com",
	"region": "auto"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `accountId` | string | 是 | Cloudflare Account ID |
| `accessKeyId` | string | 否* | R2 Access Key ID |
| `secretAccessKey` | string | 否* | R2 Secret Access Key |
| `bucketName` | string | 是 | 存储桶名称 |
| `customDomain` | string | 否 | 自定义域名 |
| `region` | string | 否 | 区域，默认 `auto` |

> *注：首次配置时必填；更新时如果不传则保留原值。

**响应示例**

```json
{
	"ok": true
}
```

**错误响应**

```json
{
	"error": "缺少必填字段"
}
```

---

### 5.3 测试 R2 连接（管理员）

```
POST /admin/settings/r2/test
```

**请求参数**: 无（使用数据库中已保存的配置）

**响应示例 - 成功**

```json
{
	"success": true,
	"message": "连接成功"
}
```

**响应示例 - 失败**

```json
{
	"success": false,
	"error": "无法连接到 R2 存储桶，请检查配置"
}
```

---

### 5.4 上传图片到 R2（管理员）

```
POST /admin/upload
```

**请求格式**: `multipart/form-data`

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | File | 是 | 图片文件 |

**支持的图片格式**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

**文件大小限制**: 5MB

**响应示例 - 成功**

```json
{
	"ok": true,
	"url": "https://cdn.example.com/images/abc123.jpg",
	"key": "images/abc123.jpg"
}
```

**响应示例 - 失败**

```json
{
	"error": "R2 存储未配置，请先在系统设置中配置"
}
```

```json
{
	"error": "文件类型不支持，仅支持 jpg/png/gif/webp 格式"
}
```

```json
{
	"error": "文件大小超过限制（最大 5MB）"
}
```

---

## 6. 错误码约定（可选）

| 错误码 | 描述                |
| ------ | ------------------- |
| `401`  | 未登录或 token 无效 |
| `403`  | 权限不足            |
| `404`  | 资源不存在          |
| `500`  | 内部错误            |

---

## 7. 开发建议

- **公共中间件**：token 校验函数，解析 JWT 并在 KV 中检查 token 状态
- **统一返回工具**：封装 `jsonResponse(success, data, error)`
- **D1 ORM**：可直接用 SQL 或小型 ORM（例如 drizzle-orm for D1）
- **前端调用**：Axios 或 fetch，封装 request 方法自动附带 token
