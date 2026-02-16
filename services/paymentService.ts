import { supabase } from './supabaseClient';
import { getCurrentUser } from './authService';

/**
 * 支付服务 - 易支付集成
 */

export interface CreateOrderResult {
    success: boolean;
    payUrl?: string;
    outTradeNo?: string;
    error?: string;
}

export interface PaymentOrder {
    id: string;
    user_id: string;
    out_trade_no: string;
    trade_no: string | null;
    amount: number;
    coins: number;
    bonus: number;
    status: 'pending' | 'paid' | 'failed' | 'expired';
    pay_type: string;
    created_at: string;
    paid_at: string | null;
}

// 创建支付订单
export const createPaymentOrder = async (
    itemId: string,
    amount: number,
    coins: number,
    bonus: number,
    payType: 'alipay' | 'wxpay' = 'alipay'
): Promise<CreateOrderResult> => {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, error: 'Not logged in' };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    
    if (!accessToken) {
        return { success: false, error: 'No session' };
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
        console.error('VITE_SUPABASE_URL is missing');
        return { success: false, error: '配置错误: 缺少 API 地址 (请在 Zeabur 设置环境变量)' };
    }
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
        const response = await fetch(
            `${supabaseUrl}/functions/v1/create-order`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'apikey': supabaseAnonKey,
                },
                body: JSON.stringify({
                    itemId,
                    amount,
                    coins,
                    bonus,
                    payType,
                }),
            }
        );

        // 处理非 JSON 响应（如 404 HTML）
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text.substring(0, 100));
            return { success: false, error: `服务器返回异常 (${response.status})` };
        }

        const result = await response.json();
        
        if (!response.ok) {
            return { success: false, error: result.error || 'Failed to create order' };
        }

        return {
            success: true,
            payUrl: result.payUrl,
            outTradeNo: result.outTradeNo,
        };
    } catch (error) {
        console.error('Error creating payment order:', error);
        return { success: false, error: '网络请求失败，请检查控制台' };
    }
};

// 查询订单状态
export const getOrderStatus = async (outTradeNo: string): Promise<PaymentOrder | null> => {
    const { data, error } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('out_trade_no', outTradeNo)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        return null;
    }

    return data;
};

// 获取用户最近订单
export const getRecentOrders = async (limit = 10): Promise<PaymentOrder[]> => {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }

    return data || [];
};
