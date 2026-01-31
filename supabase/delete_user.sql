-- ============================================
-- 删除用户账号函数
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 创建删除当前用户的函数
CREATE OR REPLACE FUNCTION delete_current_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 获取当前用户 ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- 删除用户数据（由于 CASCADE，关联表数据会自动删除）
  DELETE FROM public.user_profiles WHERE id = v_user_id;
  DELETE FROM public.user_settings WHERE id = v_user_id;
  DELETE FROM public.transactions WHERE user_id = v_user_id;
  DELETE FROM public.readings WHERE user_id = v_user_id;
  
  -- 删除 auth.users 记录
  DELETE FROM auth.users WHERE id = v_user_id;
  
  RETURN TRUE;
END;
$$;

-- 允许已认证用户调用此函数
GRANT EXECUTE ON FUNCTION delete_current_user() TO authenticated;

SELECT 'delete_current_user function created!' as status;
