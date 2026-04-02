-- 创建股票表
CREATE TABLE IF NOT EXISTS stocks (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建股票分析表
CREATE TABLE IF NOT EXISTS stock_analyses (
  id BIGSERIAL PRIMARY KEY,
  stock_id BIGINT REFERENCES stocks(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  analysis TEXT NOT NULL,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户订阅股票表
CREATE TABLE IF NOT EXISTS user_stocks (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  stock_id BIGINT REFERENCES stocks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stock_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_stock_analyses_stock_id ON stock_analyses(stock_id);
CREATE INDEX IF NOT EXISTS idx_stock_analyses_analyzed_at ON stock_analyses(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_stocks_user_id ON user_stocks(user_id);
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stocks_updated_at
  BEFORE UPDATE ON stocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 插入初始股票数据
INSERT INTO stocks (symbol, name) VALUES
  ('600519', '贵州茅台'),
  ('000858', '五粮液'),
  ('601318', '中国平安'),
  ('600036', '招商银行'),
  ('000333', '美的集团')
ON CONFLICT (symbol) DO NOTHING;
