-- 检查外键约束的详细信息
SELECT
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='user_watchlist'
    AND kcu.column_name = 'user_id';

-- 检查 users 表在哪个 schema
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name = 'users';

-- 查看当前用户是否在 public schema 的 users 表中
SELECT id, username FROM public.users WHERE id = 'e012118b-7c50-4e95-a00f-3bd35d63709a';

-- 查看是否在其他 schema 中
SELECT id, username FROM users WHERE id = 'e012118b-7c50-4e95-a00f-3bd35d63709a';
