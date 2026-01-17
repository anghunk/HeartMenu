## 0. 项目介绍

HeartMenu 是一个「情侣点餐」小应用，包含：

- 点餐端（用户）：登录后查看菜单、添加菜品到购物车、提交订单
- 管理端（后台）：管理菜品、用户、查看订单，并支持配置 Cloudflare R2 存储图片
- 后端接口：基于 Cloudflare Workers + Hono，使用 D1 作为数据库、KV 存储配置、R2 存储图片

仓库结构：

- `couple-menu-web`：前端项目（Vue 3 + Vite）
- `couple-menu-api`：后端 API（Cloudflare Workers + Hono）

后续开发计划：
- [ ] 接入小程序端，通过自建 API 登录
- [ ] 邮箱提醒等多种提醒方式

截图演示：

|后台管理端|前台点餐端|
|---|---|
|<img width="1568" height="920" alt="image" src="https://github.com/user-attachments/assets/7f527c86-9d5b-44fa-8d0c-2901a87852fc" />|<img width="374" height="825" alt="image" src="https://github.com/user-attachments/assets/06aad3c6-4ac9-4212-9fc7-c17f7ef28681" />|
|<img width="1580" height="930" alt="image" src="https://github.com/user-attachments/assets/692aff50-11f9-4356-a055-bdba2b280d94" />|<img width="375" height="825" alt="image" src="https://github.com/user-attachments/assets/f2dd5a0b-df8e-44f8-bd35-890f92a40ccc" />|
|<img width="1569" height="930" alt="image" src="https://github.com/user-attachments/assets/76c817e8-1575-4c50-b055-74a3d2551c7c" />|<img width="379" height="825" alt="image" src="https://github.com/user-attachments/assets/a3582354-4e03-459f-b033-d787261c21f2" />|

---

## 1. 后端部署（couple-menu-api）

后端基于 Cloudflare Workers + Hono，使用：

- D1 作为关系型数据库（存储用户、菜单、订单等）
- KV 存储配置信息
- R2 存储菜品图片（可选）

### (1) 环境准备

- 安装 Node.js（建议 ≥ 18）
- 安装 wrangler CLI：

```bash
npm install -g wrangler
```

### (2) 安装依赖

```bash
cd couple-menu-api
npm install
```

### (3) 配置 wrangler.toml

项目中提供了一个模板文件：

```bash
cd couple-menu-api
cp wrangler.toml.example wrangler.toml
```

编辑 `wrangler.toml`，根据你的实际情况修改：

```toml
[vars]
JWT_SECRET = "修改为一个随机且足够复杂的字符串"
ADMIN_USERNAME = "后台管理员用户名"
ADMIN_PASSWORD = "后台管理员密码"

[[d1_databases]]
binding = "DB"
database_name = "couple-menu-db"
database_id = "你的 D1 数据库 ID"

[[kv_namespaces]]
binding = "KV"
id = "你的 KV Namespace ID"
```

### (4) 创建 D1 数据库与 KV

> 以下命令在 `couple-menu-api` 目录下执行，并且需要你已经通过 `wrangler login` 登录 Cloudflare 账号。

#### 创建 D1 数据库

```bash
wrangler d1 create couple-menu-db
```

创建成功后会得到一个 `database_id`，填入 `wrangler.toml` 中对应字段。

#### 创建 KV Namespace

```bash
wrangler kv namespace create couple_menu_db
```

创建成功后会得到一个 `id`，填入 `wrangler.toml` 中 `[[kv_namespaces]]` 的 `id` 字段。

### (5) 初始化 / 重置数据库

#### 重置数据库表

```bash
wrangler d1 execute couple-menu-db --remote --command "DROP TABLE IF EXISTS orders; DROP TABLE IF EXISTS menu_items; DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS r2_config;"
```

#### 执行 schema.sql 初始化表结构

```bash
wrangler d1 execute couple-menu-db --remote --file=./schema.sql
```

> 可以根据需要多次执行，保证表结构与最新 schema 同步。

### (6) 本地开发（可选）

```bash
npm run dev
```

`wrangler dev` 会启动一个本地开发环境，默认地址类似：

```text
http://127.0.0.1:8787
```

此时可以在前端 `.env` 中将 `VITE_API_BASE_URL` 设置为该地址进行本地联调：

```env
VITE_API_BASE_URL=http://127.0.0.1:8787
```

### (7) 部署到 Cloudflare Workers

确认 `wrangler.toml` 配置正确，D1 和 KV 已经创建并绑定好后，执行：

```bash
npm run deploy
```

等价于：

```bash
wrangler deploy
```

部署成功后，会得到一个 Worker 域名，例如：

```text
https://couple-menu-api.your-account.workers.dev
```

将该地址配置到前端的 `VITE_API_BASE_URL` 中即可完成前后端联通。

---

## 2. 前端部署（couple-menu-web）

### (1) 环境准备

- Node.js（建议 ≥ 18）
- npm / pnpm / yarn（以下示例使用 npm）

### (2) 安装依赖

```bash
cd couple-menu-web
npm install
```

### (3) 配置环境变量

> 所有前端环境变量必须以 `VITE_` 开头，构建时会被写入打包后的 JS 中。

#### 开发环境（本地）

使用 `.env` 文件：

```bash
cp .env.example .env
```

然后根据实际情况修改 `.env`：

```env
VITE_API_BASE_URL=https://your-api-domain.example.com
VITE_ADMIN_USERNAME=你的后台默认用户名（仅本地开发时可用）
VITE_ADMIN_PASSWORD=你的后台默认密码（仅本地开发时可用）
```

本地开发运行：

```bash
npm run dev
```

Vite 会自动读取 `.env` 中的变量。

#### 生产环境（Cloudflare Pages）

生产环境一般使用两种方式之一：

1. 使用 `.env.production` 文件（基于模板）

   ```bash
   cp .env.production.example .env.production
   ```

   然后在 `.env.production` 中配置生产接口地址：

   ```env
   VITE_API_BASE_URL=https://your-api-domain.example.com
   ```

   当 Cloudflare Pages 执行 `npm run build` 时，Vite 会读取 `.env.production`，将变量值写入打包后的代码中。

2. 使用 Cloudflare Pages 后台环境变量配置（推荐）
   - 打开 Cloudflare Pages → 选择当前项目
   - 进入「Settings → Environment variables」
   - 在 **Production** 环境中添加：
     - `VITE_API_BASE_URL=https://your-api-domain.example.com`

   - 保存后重新部署

   这样就不需要在仓库中提交 `.env.production` 文件，构建时同样可以拿到 `VITE_API_BASE_URL`。

### (4) 打包构建

```bash
npm run build
```

构建产物输出在 `couple-menu-web/dist` 目录，可部署到任意静态托管平台（如 Cloudflare Pages、Vercel、Netlify、Nginx 等）。

---

## 3. 登录与角色说明

- 管理端后台
  - 地址：`/admin`
  - 登录接口：`POST /auth/admin/login`
  - 使用 `wrangler.toml` 中配置的 `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- 点餐端用户
  - 地址：`/app`
  - 登录接口：`POST /auth/user/login`
  - 用户账号由后台管理端通过「用户管理」创建（`/admin/users`）

---

## 4. R2 图片存储（可选）

如果想在后台上传菜品图片到 Cloudflare R2：

1. 在 Cloudflare 控制台创建 R2 存储桶
2. 获取 `accountId`、`accessKeyId`、`secretAccessKey`、`bucketName` 等信息
3. 在管理端「系统设置」页面中填入 R2 配置并保存
4. 测试连接通过后，即可在菜单管理中上传菜品图片
