-- 1. 先删除可能存在的错误外键约束
ALTER TABLE user_watchlist 
DROP CONSTRAINT IF EXISTS user_watchlist_user_id_fkey;

-- 2. 重新创建正确的外键约束，指向 public.users
ALTER TABLE user_watchlist
ADD CONSTRAINT user_watchlist_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- 3. 验证外键约束
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
