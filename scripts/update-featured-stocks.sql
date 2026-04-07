-- 特别关注股票列表
-- 包含A股、港股、美股精选标的
-- 执行前请确保已运行 supabase-schema-v2.sql

-- 清除旧的特别关注数据（如果存在）
DELETE FROM stocks WHERE list_type = 'featured';

-- 插入A股
INSERT INTO stocks (symbol, name, list_type, display_order) VALUES
('600519.SH', '贵州茅台', 'featured', 1),
('002415.SZ', '海康威视', 'featured', 2),
('159941.SZ', '纳指ETF广发', 'featured', 3),
('000426.SZ', '兴业银锡', 'featured', 4),
('601919.SH', '中远海控', 'featured', 5);

-- 插入港股
INSERT INTO stocks (symbol, name, list_type, display_order) VALUES
('01712.HK', '龙资源', 'featured', 6),
('2233.HK', '西部水泥', 'featured', 7),
('0883.HK', '中国海洋石油', 'featured', 8),
('1919.HK', '中远海控', 'featured', 9);

-- 插入美股
INSERT INTO stocks (symbol, name, list_type, display_order) VALUES
('VTV', 'Vanguard Value ETF', 'featured', 10),
('PDD', '拼多多', 'featured', 11),
('VOO', 'Vanguard S&P 500 ETF', 'featured', 12),
('VYM', 'Vanguard High Dividend Yield ETF', 'featured', 13),
('EWJ', 'iShares MSCI Japan ETF', 'featured', 14);

-- 验证插入结果
SELECT symbol, name, list_type, display_order 
FROM stocks 
WHERE list_type = 'featured' 
ORDER BY display_order;
