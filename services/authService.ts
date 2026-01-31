import { supabase } from './supabaseClient';
import type { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * 认证服务 - 基于 Supabase Auth
 */

// 发送 OTP 验证码到邮箱（使用 token 模式，不是 magic link）
export const signInWithOtp = async (email: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            emailRedirectTo: undefined,
        },
    });
    return { error };
};

// ============================================
// 密码认证
// ============================================

// 密码注册
export const signUpWithPassword = async (
    email: string,
    password: string
): Promise<{ user: User | null; error: AuthError | null }> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // 跳过邮件确认（开发阶段）
            emailRedirectTo: undefined,
        },
    });
    return { user: data.user, error };
};

// 密码登录
export const signInWithPassword = async (
    email: string,
    password: string
): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { user: data.user, session: data.session, error };
};

// 验证 OTP
export const verifyOtp = async (
    email: string,
    token: string
): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> => {
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
    });
    return { user: data.user, session: data.session, error };
};

// 获取当前用户
export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// 获取当前 Session
export const getSession = async (): Promise<Session | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

// 监听认证状态变化
export const onAuthStateChange = (callback: (user: User | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            callback(session?.user ?? null);
        }
    );
    return subscription;
};

// 退出登录
export const signOut = async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

// 注销账户（删除用户数据）
export const deleteAccount = async (): Promise<{ error: Error | null }> => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { error: new Error('No user logged in') };
        }

        // 调用数据库函数删除用户（包括 auth.users 记录）
        const { error: deleteError } = await supabase.rpc('delete_current_user');

        if (deleteError) {
            console.error('Delete user error:', deleteError);
            return { error: new Error(deleteError.message) };
        }

        // 退出登录
        await signOut();

        return { error: null };
    } catch (e) {
        return { error: e as Error };
    }
};
