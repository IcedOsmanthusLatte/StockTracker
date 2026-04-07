-- 临时禁用 RLS 来测试
ALTER TABLE user_watchlist DISABLE ROW LEVEL SECURITY;

-- 查看当前的 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('users', 'user_watchlist');

-- 如果需要，也可以禁用 users 表的 RLS
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
