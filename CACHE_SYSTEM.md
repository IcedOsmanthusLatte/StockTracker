# 智能缓存系统说明

## 📋 功能概述

智能缓存系统实现了基于中国时间的每日股票分析缓存，大幅降低API调用成本并提升用户体验。

## ✨ 核心特性

### 1. 每日缓存机制
- **存储策略**：每只股票只保存当天最新的分析数据
- **时区处理**：基于中国时间（UTC+8）的0点划分缓存
- **自动覆盖**：新的分析会覆盖当天的旧数据

### 2. 智能查询流程
当前端请求AI分析时：
1. 首先检查是否有当天的缓存
2. 如果有缓存，直接返回（节省API调用）
3. 如果没有缓存，调用AI分析并保存到当天缓存

### 3. 重试机制
- **最大重试次数**：3次
- **退避策略**：指数退避（1秒、2秒、4秒）
- **错误处理**：如果3次都失败，返回错误信息

### 4. 定时更新
**每天早上10点（中国时间）自动执行：**
- 更新伯克希尔前十大持仓列表
- 更新特别关注股票列表
- 更新前检查：如果已有当天缓存则跳过

### 5. 启动时更新
**项目启动时自动执行：**
- 检查伯克希尔和特别关注列表
- 如果没有当天缓存，则进行更新
- 异步执行，不阻塞应用启动

## 📁 文件结构

```
lib/
├── cache-utils.ts          # 缓存工具函数
│   ├── getChinaDateString()      # 获取中国时间日期
│   ├── getTodayCache()           # 获取当天缓存
│   ├── saveTodayCache()          # 保存/更新当天缓存
│   └── analyzeWithRetry()        # 带重试的分析函数
│
├── scheduled-tasks.ts      # 定时任务
│   ├── updateListCache()         # 更新指定列表缓存
│   ├── dailyScheduledUpdate()    # 每日定时更新
│   ├── startupCacheUpdate()      # 启动时更新
│   └── startScheduler()          # 启动调度器
│
└── init.ts                 # 应用初始化
    └── initializeApp()           # 初始化函数

app/api/
└── analyze/route.ts        # AI分析API（已集成缓存）

instrumentation.ts          # Next.js启动钩子
```

## 🔧 技术实现

### 缓存键设计
- **symbol**: 股票代码（如 "600519.SH"）
- **analysis_date**: 中国时间日期（如 "2026-04-07"）
- **analyzed_at**: 分析时间戳（ISO 8601格式）

### 数据库表结构
```sql
stock_analyses (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER,
  symbol TEXT,
  analysis TEXT,
  analyzed_at TIMESTAMP,
  analysis_date DATE,  -- 用于按日期缓存
  created_at TIMESTAMP
)
```

### 时区转换逻辑
```typescript
// 获取中国时间的今天日期
const now = new Date();
const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
const dateString = chinaTime.toISOString().split('T')[0];
```

## 📊 性能优化

### API调用节省
- **无缓存**：每次点击都调用AI（成本高）
- **有缓存**：同一股票当天只调用1次AI

**示例**：
- 伯克希尔10只股票 + 特别关注14只股票 = 24只
- 每只股票平均被查看5次/天
- 无缓存：24 × 5 = 120次API调用/天
- 有缓存：24 × 1 = 24次API调用/天
- **节省**：80% API调用成本 💰

### 延迟控制
- 定时任务每次分析后等待2秒，避免API限流
- 用户请求立即返回缓存，无等待时间

## 🚀 使用方式

### 自动运行
系统会自动执行以下操作：
1. **项目启动时**：自动更新缺失的当天缓存
2. **每天10点**：自动更新所有列表的缓存
3. **用户点击分析**：自动检查并使用缓存

### 手动触发（可选）
```bash
# 访问初始化API（仅用于测试）
curl http://localhost:3000/api/init
```

## 📝 日志示例

### 缓存命中
```
[Analyze API] 使用 600519.SH 的当天缓存
```

### 缓存未命中
```
[Analyze API] 600519.SH 没有当天缓存，开始AI分析
[Retry] 尝试分析 (第 1/3 次)
[Cache] 创建了 600519.SH 的当天缓存
[Analyze API] 600519.SH 分析完成并已缓存
```

### 定时任务
```
[Scheduled Task] 开始更新 berkshire 列表缓存...
[Scheduled Task] 找到 10 只 berkshire 股票
[Scheduled Task] AAPL 已有当天缓存，跳过
[Scheduled Task] 开始分析 BAC (美国银行)
[Cache] 创建了 BAC 的当天缓存
[Scheduled Task] berkshire 列表更新完成:
  - 更新: 3 只
  - 跳过: 7 只
  - 失败: 0 只
```

## ⚠️ 注意事项

1. **时区一致性**：所有缓存判断基于中国时间（UTC+8）
2. **数据覆盖**：同一天的新分析会覆盖旧分析
3. **重试限制**：最多重试3次，避免无限循环
4. **启动延迟**：首次启动可能需要几分钟更新缓存（异步执行）

## 🔍 故障排查

### 缓存未生效
1. 检查数据库中是否有 `analysis_date` 字段
2. 查看控制台日志确认缓存逻辑执行
3. 验证中国时间计算是否正确

### 定时任务未执行
1. 检查 `instrumentation.ts` 是否正确加载
2. 查看 `next.config.mjs` 中是否启用了 `instrumentationHook`
3. 查看控制台是否有调度器启动日志

### 重试失败
1. 检查AI API密钥是否有效
2. 查看错误日志了解失败原因
3. 验证网络连接和API限流情况

## 📈 未来优化

- [ ] 添加缓存预热功能
- [ ] 支持手动刷新缓存
- [ ] 添加缓存统计和监控
- [ ] 实现缓存过期策略（保留历史数据）
