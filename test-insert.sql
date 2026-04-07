-- 测试直接插入到 user_watchlist
-- 首先确认用户存在
SELECT id, username FROM users WHERE id = 'e012118b-7c50-4e95-a00f-3bd35d63709a';

-- 查找一个现有的股票ID
SELECT id, symbol, name FROM stocks LIMIT 1;

-- 尝试手动插入（使用上面查询到的 stock_id）
-- 假设 stock_id 是 1，如果不是请替换
INSERT INTO user_watchlist (user_id, stock_id)
VALUES ('e012118b-7c50-4e95-a00f-3bd35d63709a', 1)
RETURNING *;

-- 如果上面成功，查看结果
SELECT * FROM user_watchlist WHERE user_id = 'e012118b-7c50-4e95-a00f-3bd35d63709a';
