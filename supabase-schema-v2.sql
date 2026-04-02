-- 新的数据库架构设计

-- 1. 用户表（使用Supabase Auth，这里只是参考）
-- Supabase自带auth.users表，我们创建一个profiles表来扩展用户信息
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 股票列表类型枚举（如果已存在则跳过）
DO $$ BEGIN
  CREATE TYPE stock_list_type AS ENUM ('berkshire', 'featured', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. 股票表（保持原有结构，添加列表类型）
-- 先创建表（如果不存在）
CREATE TABLE IF NOT EXISTS stocks (
  id SERIAL PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加新列（如果不存在）
DO $$ BEGIN
  ALTER TABLE stocks ADD COLUMN list_type stock_list_type DEFAULT 'user';
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE stocks ADD COLUMN display_order INTEGER DEFAULT 0;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- 4. 股票分析表（添加分析日期字段用于缓存判断）
CREATE TABLE IF NOT EXISTS stock_analyses (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  analysis TEXT NOT NULL,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加analysis_date列（如果不存在）
DO $$ BEGIN
  ALTER TABLE stock_analyses ADD COLUMN analysis_date DATE DEFAULT CURRENT_DATE;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- 5. 用户关注的股票表（限制每个用户最多5只）
CREATE TABLE IF NOT EXISTS user_watchlist (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stock_id)
);

-- 6. 创建索引
CREATE INDEX IF NOT EXISTS idx_stocks_list_type ON stocks(list_type);
CREATE INDEX IF NOT EXISTS idx_stock_analyses_symbol ON stock_analyses(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_analyses_date ON stock_analyses(analysis_date);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_user ON user_watchlist(user_id);

-- 7. 插入伯克希尔前十大持仓（2024年Q4数据示例）
INSERT INTO stocks (symbol, name, list_type, display_order) VALUES
  ('AAPL', '苹果公司', 'berkshire', 1),
  ('BAC', '美国银行', 'berkshire', 2),
  ('AXP', '美国运通', 'berkshire', 3),
  ('KO', '可口可乐', 'berkshire', 4),
  ('CVX', '雪佛龙', 'berkshire', 5),
  ('OXY', '西方石油', 'berkshire', 6),
  ('KHC', '卡夫亨氏', 'berkshire', 7),
  ('MCO', '穆迪', 'berkshire', 8),
  ('DVA', 'DaVita', 'berkshire', 9),
  ('ALLY', 'Ally Financial', 'berkshire', 10)
ON CONFLICT (symbol) DO UPDATE SET
  list_type = EXCLUDED.list_type,
  display_order = EXCLUDED.display_order;

-- 8. 插入特别关注股票（示例）
INSERT INTO stocks (symbol, name, list_type, display_order) VALUES
  ('600519', '贵州茅台', 'featured', 1),
  ('000858', '五粮液', 'featured', 2),
  ('601318', '中国平安', 'featured', 3),
  ('600036', '招商银行', 'featured', 4),
  ('000333', '美的集团', 'featured', 5)
ON CONFLICT (symbol) DO UPDATE SET
  list_type = EXCLUDED.list_type,
  display_order = EXCLUDED.display_order;

-- 9. RLS策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_analyses ENABLE ROW LEVEL SECURITY;

-- 所有人可以读取stocks和stock_analyses
CREATE POLICY "Anyone can read stocks" ON stocks FOR SELECT USING (true);
CREATE POLICY "Anyone can read analyses" ON stock_analyses FOR SELECT USING (true);

-- 用户只能读取自己的watchlist
CREATE POLICY "Users can read own watchlist" ON user_watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watchlist" ON user_watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own watchlist" ON user_watchlist FOR DELETE USING (auth.uid() = user_id);

-- 用户可以读取自己的profile
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 10. 函数：检查用户watchlist数量限制
CREATE OR REPLACE FUNCTION check_watchlist_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM user_watchlist WHERE user_id = NEW.user_id) >= 5 THEN
    RAISE EXCEPTION 'Cannot add more than 5 stocks to watchlist';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_watchlist_limit
  BEFORE INSERT ON user_watchlist
  FOR EACH ROW
  EXECUTE FUNCTION check_watchlist_limit();

-- 11. 函数：获取当天的分析（按中国时间）
CREATE OR REPLACE FUNCTION get_today_analysis(stock_symbol TEXT)
RETURNS TABLE (
  id INTEGER,
  analysis TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT sa.id, sa.analysis, sa.analyzed_at
  FROM stock_analyses sa
  WHERE sa.symbol = stock_symbol
    AND sa.analysis_date = CURRENT_DATE
  ORDER BY sa.analyzed_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
