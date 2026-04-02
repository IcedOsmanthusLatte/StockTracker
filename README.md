# StockTracker - AI驱动的智能股票追踪平台

一个现代化的股票追踪和分析平台，使用AI技术提供专业的投资建议。

## 功能特性

✨ **AI智能分析** - 使用xAI Grok模型深度分析股票数据，提供专业投资建议

📊 **公开追踪列表** - 查看每日更新的公开股票分析，了解市场热点

👤 **个性化订阅** - 创建专属股票追踪列表，获取定制化AI分析

🔐 **极简认证** - 基于Cookie的无注册认证系统，即用即开始

🎨 **现代UI** - 使用TailwindCSS和Lucide图标打造的美观界面

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: TailwindCSS
- **AI**: xAI Grok-beta
- **图标**: Lucide React
- **认证**: Cookie-based (UUID)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填写必要的API密钥：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：

```env
# xAI API Key (必需)
# 获取地址: https://console.x.ai
XAI_API_KEY=your-xai-api-key-here

# Stock API Key (可选 - 当前使用模拟数据)
# 如需真实数据，可使用 Alpha Vantage: https://www.alphavantage.co/support/#api-key
STOCK_API_KEY=your_alpha_vantage_api_key_here

# Cookie Secret (可选 - 用于加密用户会话)
COOKIE_SECRET=your_random_secret_key_here
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
StockTracker/
├── app/                      # Next.js App Router
│   ├── api/                  # API路由
│   │   ├── analyze/         # AI分析接口
│   │   ├── public-list/     # 公开列表接口
│   │   ├── stocks/          # 股票数据接口
│   │   └── subscriptions/   # 订阅管理接口
│   ├── public-list/         # 公开列表页面
│   ├── my-stocks/           # 个人订阅页面
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   └── globals.css          # 全局样式
├── lib/                      # 工具库
│   ├── ai-prompt.ts         # AI提示词模板
│   ├── auth.ts              # Cookie认证
│   ├── openai.ts            # OpenAI集成
│   ├── stock-data.ts        # 股票数据处理
│   └── storage.ts           # 数据存储
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 核心功能说明

### 1. AI分析提示词模板

位于 `lib/ai-prompt.ts`，定义了股票分析的提示词模板，包括：
- 技术面分析
- 基本面分析
- 风险评估
- 投资建议

可根据需求自定义提示词来调整AI分析的角度和深度。

### 2. Cookie认证系统

使用UUID生成唯一用户ID，存储在HttpOnly Cookie中：
- 无需注册流程
- 自动创建用户会话
- 安全的Cookie设置
- 365天有效期

### 3. 公开追踪列表

默认追踪的股票：
- AAPL (苹果)
- MSFT (微软)
- GOOGL (谷歌)
- TSLA (特斯拉)
- NVDA (英伟达)

可在 `lib/storage.ts` 中修改公开列表。

### 4. 数据缓存

AI分析结果按日期缓存，避免重复调用API：
- 同一天内相同股票的分析会使用缓存
- 每日自动清理过期缓存

## API接口说明

### GET /api/stocks
获取股票数据
- `?symbol=AAPL` - 获取单个股票
- `?query=apple` - 搜索股票

### POST /api/analyze
AI分析股票
```json
{
  "symbol": "AAPL"
}
```

### GET /api/public-list
获取公开追踪列表

### GET /api/subscriptions
获取用户订阅列表

### POST /api/subscriptions
添加订阅
```json
{
  "symbol": "AAPL"
}
```

### DELETE /api/subscriptions?symbol=AAPL
删除订阅

## 自定义配置

### 修改AI模型

编辑 `lib/openai.ts`：

```typescript
// 修改模型参数
model: 'grok-beta',    // xAI Grok模型
temperature: 0.5,      // 调整创造性（0-1）
max_tokens: 1200,      // 调整响应长度
```

### 添加真实股票数据

当前使用模拟数据，可在 `lib/stock-data.ts` 中集成真实API：
- Alpha Vantage
- Yahoo Finance
- IEX Cloud
- Finnhub

### 修改提示词模板

编辑 `lib/ai-prompt.ts` 中的 `STOCK_ANALYSIS_PROMPT` 来自定义分析角度。

## 注意事项

⚠️ **xAI API费用**: 每次AI分析会调用xAI Grok API，请注意API使用量和费用

⚠️ **数据存储**: 当前使用内存存储，重启服务器会丢失数据。生产环境建议使用数据库

⚠️ **股票数据**: 当前使用模拟数据，实际部署需接入真实股票API

⚠️ **免责声明**: 本平台提供的分析仅供参考，不构成投资建议

## 部署建议

### Vercel部署

1. 推送代码到GitHub
2. 在Vercel导入项目
3. 配置环境变量
4. 自动部署

### 数据库集成建议

生产环境建议使用：
- **PostgreSQL** + Prisma (用户订阅、分析历史)
- **Redis** (缓存AI分析结果)
- **Vercel KV** (简单键值存储)

## 开发计划

- [ ] 集成真实股票数据API
- [ ] 添加数据库持久化
- [ ] 股票价格图表展示
- [ ] 邮件/推送通知
- [ ] 更多技术指标分析
- [ ] 多语言支持

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提Issue或PR。
