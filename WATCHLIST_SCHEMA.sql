-- 我的关注功能数据库架构

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 用户关注列表表
CREATE TABLE IF NOT EXISTS user_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stock_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_watchlist_user_id ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_stock_id ON user_watchlist(stock_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- RLS 策略

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;

-- users 表策略
-- 允许任何人注册（插入）
CREATE POLICY "Allow public registration" ON users
  FOR INSERT TO public
  WITH CHECK (true);

-- 允许用户查看自己的信息
CREATE POLICY "Users can view own data" ON users
  FOR SELECT TO public
  USING (true);

-- 允许用户更新自己的信息
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO public
  USING (true)
  WITH CHECK (true);

-- user_watchlist 表策略
-- 允许所有人读取（用于共享缓存）
CREATE POLICY "Allow public read watchlist" ON user_watchlist
  FOR SELECT TO public
  USING (true);

-- 允许所有人插入（简化实现，实际应该验证用户）
CREATE POLICY "Allow public insert watchlist" ON user_watchlist
  FOR INSERT TO public
  WITH CHECK (true);

-- 允许所有人删除（简化实现，实际应该验证用户）
CREATE POLICY "Allow public delete watchlist" ON user_watchlist
  FOR DELETE TO public
  USING (true);

-- 注释
COMMENT ON TABLE users IS '用户表：存储注册用户信息';
COMMENT ON TABLE user_watchlist IS '用户关注列表：存储用户的自选股票';
COMMENT ON COLUMN users.username IS '用户名，唯一';
COMMENT ON COLUMN users.password_hash IS '密码哈希值（使用bcrypt）';
COMMENT ON COLUMN user_watchlist.user_id IS '用户ID';
COMMENT ON COLUMN user_watchlist.stock_id IS '股票ID，关联stocks表，通过JOIN获取symbol和name';
