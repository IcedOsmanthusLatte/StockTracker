# 我的关注功能环境变量配置

## 🔑 需要添加的环境变量

在 `.env.local` 文件中添加以下环境变量：

```env
# Supabase Service Role Key（用于服务端操作，绕过RLS）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 📋 如何获取 Service Role Key

1. **登录 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择你的项目：StockTracker

2. **获取 Service Role Key**
   - 点击左侧菜单：**Settings** → **API**
   - 在 **Project API keys** 部分找到：
     - `service_role` key（这是一个很长的字符串）
   - **⚠️ 重要**：这个key有完整的数据库访问权限，绝对不能暴露给前端！

3. **添加到 .env.local**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（你的完整key）
   ```

## ⚠️ 安全注意事项

### ✅ 正确使用
- **仅在服务端使用**：只在 `/app/api/` 路由中使用
- **不要暴露给前端**：绝对不要在客户端组件中使用
- **不要提交到Git**：确保 `.env.local` 在 `.gitignore` 中

### ❌ 错误使用
- ~~在客户端组件中使用~~
- ~~使用 `NEXT_PUBLIC_` 前缀~~
- ~~提交到代码仓库~~

## 🔐 为什么需要 Service Role Key？

### 问题
我们的认证系统使用自定义的 `users` 表（用户名+密码），而不是 Supabase Auth。但 Supabase 的 RLS（Row Level Security）策略默认基于 Supabase Auth 的用户。

### 解决方案
使用 Service Role Key 可以绕过 RLS 限制，允许我们：
1. 在 `users` 表中创建用户（注册）
2. 查询 `users` 表验证密码（登录）
3. 管理 `user_watchlist` 表（添加/删除关注）

### 简化的 RLS 策略
在 `WATCHLIST_SCHEMA.sql` 中，我们设置了简化的公开访问策略：
```sql
CREATE POLICY "Allow public read watchlist" ON user_watchlist
  FOR SELECT TO public
  USING (true);
```

这样可以让多个用户共享同一只股票的AI分析缓存。

## 📝 完整的 .env.local 示例

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI配置
XAI_API_KEY=your_xai_api_key_here
```

## 🚀 启动应用

配置完成后，重启开发服务器：

```bash
npm run dev
```

## ✅ 验证配置

1. 访问应用的"我的关注"Tab
2. 点击"注册"按钮
3. 输入用户名和密码
4. 如果注册成功，说明配置正确！

## 🐛 常见问题

### 问题1：注册时提示"注册失败"
**原因**：Service Role Key 未配置或配置错误

**解决**：
1. 检查 `.env.local` 中是否有 `SUPABASE_SERVICE_ROLE_KEY`
2. 确认 key 是完整的（通常很长）
3. 重启开发服务器

### 问题2：TypeScript 报错 "Cannot find name 'process'"
**原因**：缺少 Node.js 类型定义

**解决**：
```bash
npm install --save-dev @types/node
```

### 问题3：数据库操作失败
**原因**：RLS 策略未正确设置

**解决**：
1. 确认已在 Supabase 中执行 `WATCHLIST_SCHEMA.sql`
2. 检查 RLS 策略是否正确创建

## 📚 相关文档

- `WATCHLIST_SCHEMA.sql` - 数据库架构
- `WATCHLIST_FEATURE.md` - 功能设计文档
- `CACHE_SYSTEM.md` - 缓存系统说明
