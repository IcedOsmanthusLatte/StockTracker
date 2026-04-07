-- 修复用户记录
-- 如果用户不存在，插入用户记录
INSERT INTO users (id, username, password_hash, created_at)
VALUES (
  'e012118b-7c50-4e95-a00f-3bd35d63709a',
  'tangling2024@gmail.com',
  '$2a$10$dummy.hash.for.existing.user.placeholder',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 查看用户是否存在
SELECT * FROM users WHERE id = 'e012118b-7c50-4e95-a00f-3bd35d63709a';
