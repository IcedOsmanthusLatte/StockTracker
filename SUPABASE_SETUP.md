# Supabase 设置指南

## 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project"
4. 填写项目信息：
   - Name: StockTracker
   - Database Password: 设置一个强密码（请记住）
   - Region: 选择离你最近的区域（如 Northeast Asia (Tokyo)）
5. 点击 "Create new project"，等待项目创建完成（约2分钟）

## 2. 获取 API 密钥

项目创建完成后：
1. 在左侧菜单点击 "Settings" → "API"
2. 复制以下两个值：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. 配置环境变量

在项目根目录的 `.env.local` 文件中添加：

```env
NEXT_PUBLIC_SUPABASE_URL=你的Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_public_key
```

## 4. 创建数据库表

1. 在 Supabase 控制台，点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 复制 `supabase-schema.sql` 文件的全部内容
4. 粘贴到 SQL 编辑器中
5. 点击 "Run" 执行 SQL

执行成功后，你会看到以下表被创建：
- `stocks` - 股票基本信息
- `stock_analyses` - 股票分析记录
- `user_stocks` - 用户订阅的股票

## 5. 验证设置

在 Supabase 控制台：
1. 点击左侧菜单的 "Table Editor"
2. 你应该能看到 3 个表
3. 点击 `stocks` 表，应该能看到 5 条初始数据（茅台、五粮液等）

## 6. 启动应用

配置完成后，重启开发服务器：
```bash
npm run dev
```

现在应用将使用 Supabase 数据库来存储和管理数据！
