-- ============================================
-- 修复触发器权限问题
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 1. 删除旧触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. 为 user_profiles 添加服务角色插入策略
CREATE POLICY "Service role can insert profiles" ON user_profiles 
  FOR INSERT WITH CHECK (true);

-- 3. 为 user_settings 添加服务角色插入策略  
CREATE POLICY "Service role can insert settings" ON user_settings 
  FOR INSERT WITH CHECK (true);

-- 4. 为 transactions 添加服务角色插入策略
CREATE POLICY "Service role can insert transactions" ON transactions 
  FOR INSERT WITH CHECK (true);

-- 5. 重新创建触发器函数（使用 SECURITY DEFINER）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 创建用户配置
  INSERT INTO public.user_profiles (id) VALUES (NEW.id);
  -- 创建用户设置
  INSERT INTO public.user_settings (id) VALUES (NEW.id);
  -- 插入初始金币交易记录
  INSERT INTO public.transactions (user_id, type, amount, description)
  VALUES (NEW.id, 'initial', 0, 'Account created with initial balance');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- 记录错误但不阻止用户创建
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 6. 重新绑定触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 确认触发器创建成功
SELECT 'Trigger fix applied successfully!' as status;
