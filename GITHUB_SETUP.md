# 推送到 GitHub 的步骤

Git 仓库已初始化并完成首次提交。

## 方法 1: 使用 GitHub 网页创建仓库（推荐）

1. 访问 https://github.com/new
2. 仓库名称：`StockTracker`
3. 描述：`A stock tracking and AI analysis application with Supabase integration`
4. 选择 **Public** 或 **Private**
5. **不要**勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

7. 在创建后的页面，复制以下命令并在项目目录执行：

```bash
git remote add origin https://github.com/你的用户名/StockTracker.git
git branch -M main
git push -u origin main
```

## 方法 2: 使用 GitHub CLI（如果已安装）

```bash
gh auth login
gh repo create StockTracker --public --source=. --remote=origin --push
```

## 项目信息

### 技术栈
- **前端**: Next.js 14, React 18, TailwindCSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **AI**: xAI Grok API
- **UI**: Lucide React Icons

### 主要功能
- ✅ 股票列表管理
- ✅ AI 驱动的股票分析
- ✅ 分析结果缓存（24小时）
- ✅ Stripe 风格的现代 UI
- ✅ 实时数据展示

### 环境变量（需要配置）
```env
XAI_API_KEY=你的xAI_API密钥
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
NEXT_PUBLIC_SUPABASE_URL=你的Supabase_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase_anon_key
```

### 数据库设置
参考 `SUPABASE_SETUP.md` 和 `supabase-schema.sql`
