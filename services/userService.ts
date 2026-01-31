import { supabase, UserBalance, UserSettings } from './supabaseClient';
import { getCurrentUser } from './authService';

/**
 * 用户服务 - 余额、设置、每日奖励
 * 余额基于 transactions 表聚合计算（流水驱动）
 */

// ============================================
// 余额相关
// ============================================

// 获取用户余额和充值进度
export const getUserBalance = async (): Promise<UserBalance | null> => {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('user_balance')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching user balance:', error);
        return null;
    }

    return data;
};

// 消费金币（调用数据库函数，原子操作）
export const consumeBalance = async (
    amount: number,
    description: string
): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('consume_balance', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: description,
    });

    if (error) {
        console.error('Error consuming balance:', error);
        return false;
    }

    return data === true;
};

// ============================================
// 充值相关（可扩展架构）
// ============================================

export interface RechargeResult {
    success: boolean;
    newBalance?: number;
    newTotalRecharge?: number;
    error?: string;
}

// 模拟充值（未来替换为支付回调）
export const processRecharge = async (
    coins: number,
    bonus: number,
    referenceId?: string
): Promise<RechargeResult> => {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, error: 'No user logged in' };
    }

    const { data, error } = await supabase.rpc('process_recharge', {
        p_user_id: user.id,
        p_coins: coins,
        p_bonus: bonus,
        p_reference_id: referenceId || null,
    });

    if (error) {
        console.error('Error processing recharge:', error);
        return { success: false, error: error.message };
    }

    // 获取最新余额
    const balance = await getUserBalance();

    return {
        success: data === true,
        newBalance: balance?.balance,
        newTotalRecharge: balance?.total_recharge,
    };
};

// ============================================
// 每日奖励
// ============================================

export interface DailyBonusResult {
    claimed: boolean;
    alreadyClaimed?: boolean;
    newBalance?: number;
}

// 领取每日奖励
export const claimDailyBonus = async (): Promise<DailyBonusResult> => {
    const user = await getCurrentUser();
    if (!user) {
        return { claimed: false };
    }

    const { data, error } = await supabase.rpc('claim_daily_bonus', {
        p_user_id: user.id,
    });

    if (error) {
        console.error('Error claiming daily bonus:', error);
        return { claimed: false };
    }

    if (data === false) {
        // 今天已领取
        return { claimed: false, alreadyClaimed: true };
    }

    // 获取最新余额
    const balance = await getUserBalance();

    return {
        claimed: true,
        newBalance: balance?.balance,
    };
};

// 检查是否可以领取每日奖励（不领取，只查询）
export const canClaimDailyBonus = async (): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase
        .from('user_settings')
        .select('last_bonus_date')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error checking daily bonus:', error);
        return true; // 出错时默认显示奖励弹窗
    }

    const today = new Date().toISOString().split('T')[0];
    return data.last_bonus_date !== today;
};

// ============================================
// 用户设置
// ============================================

// 获取用户设置
export const getUserSettings = async (): Promise<UserSettings | null> => {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching user settings:', error);
        return null;
    }

    return data;
};

// 更新用户设置
export const updateUserSettings = async (
    settings: Partial<Pick<UserSettings, 'music' | 'haptic' | 'notification'>>
): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) return false;

    const { error } = await supabase
        .from('user_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('id', user.id);

    if (error) {
        console.error('Error updating user settings:', error);
        return false;
    }

    return true;
};

// ============================================
// 解锁状态
// ============================================

export const UNLOCK_THRESHOLD = 1280;

export const isMinorArcanaUnlocked = async (): Promise<boolean> => {
    const balance = await getUserBalance();
    if (!balance) return false;
    return balance.total_recharge >= UNLOCK_THRESHOLD;
};
