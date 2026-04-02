-- 更新伯克希尔前十大持仓数据（基于Q4 2025数据）
-- 数据来源：Forbes, Dataroma, SlickCharts

-- 先删除旧的伯克希尔持仓数据
DELETE FROM stocks WHERE list_type = 'berkshire';

-- 插入最新的前十大持仓（包含持仓占比）
INSERT INTO stocks (symbol, name, list_type, display_order) VALUES
  ('AAPL', '苹果公司 Apple Inc.', 'berkshire', 1),
  ('AXP', '美国运通 American Express', 'berkshire', 2),
  ('BAC', '美国银行 Bank of America', 'berkshire', 3),
  ('KO', '可口可乐 Coca-Cola', 'berkshire', 4),
  ('CVX', '雪佛龙 Chevron', 'berkshire', 5),
  ('OXY', '西方石油 Occidental Petroleum', 'berkshire', 6),
  ('CB', '安达保险 Chubb Limited', 'berkshire', 7),
  ('MCO', '穆迪 Moody''s Corporation', 'berkshire', 8),
  ('KHC', '卡夫亨氏 Kraft Heinz', 'berkshire', 9),
  ('GOOGL', '谷歌 Alphabet Inc.', 'berkshire', 10)
ON CONFLICT (symbol) DO UPDATE SET
  list_type = EXCLUDED.list_type,
  display_order = EXCLUDED.display_order,
  name = EXCLUDED.name;

-- 添加持仓占比字段到stocks表
DO $$ BEGIN
  ALTER TABLE stocks ADD COLUMN portfolio_weight DECIMAL(5,2);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- 更新持仓占比（基于Q4 2025数据，总投资组合价值$274.16B）
-- 前5大占比70.9%，前10大占比88%
UPDATE stocks SET portfolio_weight = 22.60 WHERE symbol = 'AAPL';   -- Apple
UPDATE stocks SET portfolio_weight = 20.46 WHERE symbol = 'AXP';    -- American Express
UPDATE stocks SET portfolio_weight = 10.50 WHERE symbol = 'BAC';    -- Bank of America
UPDATE stocks SET portfolio_weight = 9.20 WHERE symbol = 'KO';      -- Coca-Cola
UPDATE stocks SET portfolio_weight = 8.14 WHERE symbol = 'CVX';     -- Chevron
UPDATE stocks SET portfolio_weight = 6.50 WHERE symbol = 'OXY';     -- Occidental
UPDATE stocks SET portfolio_weight = 4.20 WHERE symbol = 'CB';      -- Chubb
UPDATE stocks SET portfolio_weight = 3.10 WHERE symbol = 'MCO';     -- Moody's
UPDATE stocks SET portfolio_weight = 2.00 WHERE symbol = 'KHC';     -- Kraft Heinz
UPDATE stocks SET portfolio_weight = 1.40 WHERE symbol = 'GOOGL';   -- Alphabet
