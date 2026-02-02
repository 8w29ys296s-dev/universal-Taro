-- ============================================
-- 支付订单表
-- ============================================
CREATE TABLE payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  out_trade_no TEXT UNIQUE NOT NULL,      -- 商户订单号
  trade_no TEXT,                           -- 易支付订单号
  amount DECIMAL(10,2) NOT NULL,           -- 订单金额（元）
  coins INTEGER NOT NULL,                  -- 对应金币数
  bonus INTEGER DEFAULT 0,                 -- 赠送金币
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  pay_type TEXT,                           -- 支付方式 (alipay/wxpay)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  notify_data JSONB                        -- 存储回调原始数据
);

CREATE INDEX idx_payment_orders_user ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_out_trade ON payment_orders(out_trade_no);

-- RLS
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON payment_orders FOR SELECT USING (auth.uid() = user_id);
-- 服务端插入/更新需要使用 service_role key 或 SECURITY DEFINER 函数
