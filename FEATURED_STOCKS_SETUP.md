# 特别关注股票列表设置指南

## 📋 需要执行的SQL脚本

文件位置：`scripts/update-featured-stocks.sql`

## 🔧 执行步骤

### 1. 登录Supabase控制台
访问：https://supabase.com/dashboard

### 2. 选择你的项目
选择 StockTracker 项目

### 3. 打开SQL编辑器
- 点击左侧菜单的 **SQL Editor**
- 点击 **New Query** 创建新查询

### 4. 复制并执行SQL
1. 打开 `scripts/update-featured-stocks.sql` 文件
2. 复制全部内容
3. 粘贴到SQL编辑器
4. 点击 **Run** 按钮执行

### 5. 验证结果
执行成功后，你应该看到：
- 14条记录插入成功
- 最后的SELECT查询显示所有特别关注股票

## 📊 股票列表

### A股（5只）
1. 贵州茅台（600519.SH）
2. 海康威视（002415.SZ）
3. 纳指ETF广发（159941.SZ）
4. 兴业银锡（000426.SZ）
5. 中远海控（601919.SH）

### 港股（4只）
6. 龙资源（01712.HK）
7. 西部水泥（2233.HK）
8. 中国海洋石油（0883.HK）
9. 中远海控（1919.HK）

### 美股（5只）
10. VTV - Vanguard Value ETF
11. PDD - 拼多多
12. VOO - Vanguard S&P 500 ETF
13. VYM - Vanguard High Dividend Yield ETF
14. EWJ - iShares MSCI Japan ETF

## ✅ 完成后

执行SQL后，特别关注页面将自动显示这14只股票。

访问 http://localhost:3001 并切换到"特别关注"Tab即可查看。

## 🎨 页面特性

- ✅ 自动识别市场类型（A股/港股/美股）
- ✅ 彩色市场标签
- ✅ AI分析功能
- ✅ 美观的渐变UI设计
- ✅ 响应式布局

## 🔄 如需修改股票列表

编辑 `scripts/update-featured-stocks.sql` 文件，然后重新执行即可。
