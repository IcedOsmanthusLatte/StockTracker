# 修复 Supabase RLS 策略问题

## 🔴 问题描述

当前遇到的错误：
```
Error saving cache: {
  code: '42501',
  message: 'new row violates row-level security policy for table "stock_analyses"'
}
```

**原因**：Supabase的行级安全策略（RLS）阻止了匿名用户向`stock_analyses`表写入数据。

## ✅ 临时解决方案

已修改`/api/analyze`路由，即使缓存保存失败也会返回AI分析结果。这样前端可以正常显示分析内容。

## 🔧 永久解决方案

需要在Supabase中为`stock_analyses`表添加RLS策略。

### 步骤：

1. **登录Supabase控制台**
   - 访问：https://supabase.com/dashboard
   - 选择你的StockTracker项目

2. **打开SQL编辑器**
   - 点击左侧菜单的 **SQL Editor**
   - 点击 **New Query** 创建新查询

3. **执行以下SQL语句**

```sql
-- 为 stock_analyses 表添加 RLS 策略
-- 允许所有人读取
CREATE POLICY "Allow public read access on stock_analyses"
ON stock_analyses
FOR SELECT
TO public
USING (true);

-- 允许所有人插入（用于缓存AI分析）
CREATE POLICY "Allow public insert on stock_analyses"
ON stock_analyses
FOR INSERT
TO public
WITH CHECK (true);

-- 允许所有人更新（用于更新缓存）
CREATE POLICY "Allow public update on stock_analyses"
ON stock_analyses
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- 验证策略
SELECT * FROM pg_policies WHERE tablename = 'stock_analyses';
```

4. **点击Run执行**

5. **验证结果**
   - 应该看到3条策略被创建
   - 刷新应用页面，AI分析应该能正常保存和显示

## 📝 说明

### 为什么需要这些策略？

- **SELECT策略**：允许前端读取缓存的AI分析
- **INSERT策略**：允许系统保存新的AI分析到缓存
- **UPDATE策略**：允许系统更新已有的缓存

### 安全性考虑

当前设置为`public`访问，因为：
1. AI分析内容是公开的，不包含敏感信息
2. 简化了开发流程
3. 未来可以根据需要添加更严格的策略（如只允许认证用户）

### 未来改进

如果需要更严格的安全控制：
```sql
-- 只允许认证用户写入
CREATE POLICY "Allow authenticated insert on stock_analyses"
ON stock_analyses
FOR INSERT
TO authenticated
WITH CHECK (true);
```

## 🎯 执行后效果

- ✅ AI分析可以正常保存到数据库
- ✅ 智能缓存系统完全正常工作
- ✅ 前端可以快速加载缓存的分析
- ✅ 每天早上10点的自动更新可以正常保存

## ⚠️ 注意事项

在执行SQL之前，请确保：
1. 已经执行了`supabase-schema-v2.sql`创建了表结构
2. 表`stock_analyses`已存在
3. RLS已启用（默认启用）

如果遇到问题，可以先检查表是否启用了RLS：
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'stock_analyses';
```

如果`rowsecurity`为`false`，需要先启用：
```sql
ALTER TABLE stock_analyses ENABLE ROW LEVEL SECURITY;
```
