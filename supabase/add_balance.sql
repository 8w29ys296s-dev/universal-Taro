-- 给指定用户添加金币（在 Supabase SQL Editor 中执行）
-- 你的 user_id: 8b503c84-5477-4bf9-96d1-1264f6ae9e9e

INSERT INTO transactions (user_id, type, amount, description)
VALUES (
  '8b503c84-5477-4bf9-96d1-1264f6ae9e9e',
  'initial',
  100,
  '手动补充初始金币'
);

-- 验证：查询当前余额
SELECT * FROM user_balance 
WHERE user_id = '8b503c84-5477-4bf9-96d1-1264f6ae9e9e';
