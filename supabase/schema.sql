-- ============================================
-- Universal Tarot AI - Supabase Schema
-- 流水驱动余额设计 (Transaction-Ledger Pattern)
-- ============================================

-- ============================================
-- 1. 用户配置表 (存储非余额的用户数据)
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_balance INTEGER DEFAULT 30,      -- 初始赠送金币
  initial_recharge INTEGER DEFAULT 200,    -- 初始赠送的充值进度（用于解锁判断）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. 交易流水表 (余额的唯一事实来源)
-- ============================================
-- 所有余额变动都通过插入此表完成，不直接修改余额字段
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('initial', 'daily_bonus', 'recharge', 'consume', 'refund')),
  amount INTEGER NOT NULL,                  -- 正数=收入，负数=支出
  recharge_value INTEGER DEFAULT 0,         -- 用于解锁进度的充值值（仅 recharge 类型有效）
  description TEXT,
  reference_id TEXT,                        -- 外部支付订单号（用于对账）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================
-- 3. 占卜记录表
-- ============================================
CREATE TABLE readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spread_type TEXT NOT NULL,
  spread_name TEXT NOT NULL,
  question TEXT,
  cards JSONB NOT NULL,                     -- 存储抽到的牌数据
  interpretation TEXT NOT NULL,              -- AI 解读内容
  language TEXT DEFAULT 'zh',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_readings_user_id ON readings(user_id);
CREATE INDEX idx_readings_created_at ON readings(created_at DESC);

-- ============================================
-- 4. 用户设置表
-- ============================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  music BOOLEAN DEFAULT true,
  haptic BOOLEAN DEFAULT true,
  notification BOOLEAN DEFAULT false,
  last_bonus_date DATE,                     -- 上次领取每日奖励的日期
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. 视图：计算用户余额（聚合 transactions）
-- ============================================
CREATE OR REPLACE VIEW user_balance AS
SELECT 
  u.id AS user_id,
  u.initial_balance + COALESCE(SUM(t.amount), 0) AS balance,
  u.initial_recharge + COALESCE(SUM(t.recharge_value), 0) AS total_recharge
FROM user_profiles u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.initial_balance, u.initial_recharge;

-- ============================================
-- 6. RLS 策略 (Row Level Security)
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- user_profiles: 用户只能读写自己的数据
CREATE POLICY "Users can view own profile" ON user_profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles 
  FOR UPDATE USING (auth.uid() = id);

-- transactions: 用户可以读取自己的交易，插入由函数控制
CREATE POLICY "Users can view own transactions" ON transactions 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- readings: 用户可以完全管理自己的记录
CREATE POLICY "Users can manage own readings" ON readings 
  FOR ALL USING (auth.uid() = user_id);

-- user_settings: 用户只能管理自己的设置
CREATE POLICY "Users can manage own settings" ON user_settings 
  FOR ALL USING (auth.uid() = id);

-- ============================================
-- 7. 触发器：新用户自动初始化
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 创建用户配置
  INSERT INTO user_profiles (id) VALUES (NEW.id);
  -- 创建用户设置
  INSERT INTO user_settings (id) VALUES (NEW.id);
  -- 插入初始金币交易记录
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (NEW.id, 'initial', 0, 'Account created with initial balance');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 绑定到 auth.users 的插入事件
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 8. 函数：安全扣费（原子操作）
-- ============================================
CREATE OR REPLACE FUNCTION consume_balance(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- 获取当前余额
  SELECT balance INTO v_current_balance 
  FROM user_balance 
  WHERE user_id = p_user_id;
  
  -- 检查余额是否足够
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- 插入消费记录
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (p_user_id, 'consume', -p_amount, p_description);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. 函数：充值处理（未来 Webhook 调用）
-- ============================================
CREATE OR REPLACE FUNCTION process_recharge(
  p_user_id UUID,
  p_coins INTEGER,
  p_bonus INTEGER,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO transactions (
    user_id, 
    type, 
    amount, 
    recharge_value, 
    description, 
    reference_id
  )
  VALUES (
    p_user_id, 
    'recharge', 
    p_coins + p_bonus,
    p_coins + p_bonus,
    'Recharge: ' || p_coins || ' coins + ' || p_bonus || ' bonus',
    p_reference_id
  );
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. 函数：每日奖励
-- ============================================
CREATE OR REPLACE FUNCTION claim_daily_bonus(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_last_date DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- 获取上次领取日期
  SELECT last_bonus_date INTO v_last_date 
  FROM user_settings 
  WHERE id = p_user_id;
  
  -- 如果今天已领取，返回 false
  IF v_last_date = v_today THEN
    RETURN FALSE;
  END IF;
  
  -- 更新领取日期
  UPDATE user_settings 
  SET last_bonus_date = v_today, updated_at = NOW()
  WHERE id = p_user_id;
  
  -- 插入奖励交易
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (p_user_id, 'daily_bonus', 10, 'Daily login bonus');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
