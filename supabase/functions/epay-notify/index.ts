import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import md5 from "https://esm.sh/blueimp-md5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 验证易支付签名
function verifySign(params: Record<string, string>, key: string): boolean {
  const sign = params.sign;
  const signType = params.sign_type || "MD5";
  
  // 过滤空值和签名字段，按 key 排序
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== "sign" && k !== "sign_type" && params[k] !== "")
    .sort();
  
  const signStr = sortedKeys.map((k) => `${k}=${params[k]}`).join("&") + key;
  const calculatedSign = md5(signStr);
  
  return calculatedSign.toLowerCase() === sign.toLowerCase();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 易支付回调是 GET 或 POST
    let params: Record<string, string> = {};
    
    if (req.method === "GET") {
      const url = new URL(req.url);
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        params[key] = String(value);
      });
    }

    console.log("Received epay notify:", params);

    // 获取配置
    const EPAY_KEY = Deno.env.get("EPAY_KEY");
    if (!EPAY_KEY) {
      console.error("EPAY_KEY not configured");
      return new Response("fail", { status: 500 });
    }

    // 验证签名
    const isValid = await verifySign(params, EPAY_KEY);
    if (!isValid) {
      console.error("Invalid signature");
      return new Response("fail", { status: 400 });
    }

    // 检查交易状态
    if (params.trade_status !== "TRADE_SUCCESS") {
      console.log("Trade not success:", params.trade_status);
      return new Response("success");
    }

    const outTradeNo = params.out_trade_no;
    const tradeNo = params.trade_no;

    // 初始化 Supabase 客户端（使用 service_role 才能绕过 RLS）
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 查询订单
    const { data: order, error: orderError } = await supabase
      .from("payment_orders")
      .select("*")
      .eq("out_trade_no", outTradeNo)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", outTradeNo);
      return new Response("fail", { status: 404 });
    }

    // 检查是否已处理
    if (order.status === "paid") {
      console.log("Order already paid:", outTradeNo);
      return new Response("success");
    }

    // 更新订单状态
    const { error: updateError } = await supabase
      .from("payment_orders")
      .update({
        status: "paid",
        trade_no: tradeNo,
        paid_at: new Date().toISOString(),
        notify_data: params,
      })
      .eq("out_trade_no", outTradeNo);

    if (updateError) {
      console.error("Failed to update order:", updateError);
      return new Response("fail", { status: 500 });
    }

    // 给用户加币
    const { error: rechargeError } = await supabase.rpc("process_recharge", {
      p_user_id: order.user_id,
      p_coins: order.coins,
      p_bonus: order.bonus,
      p_reference_id: outTradeNo,
    });

    if (rechargeError) {
      console.error("Failed to process recharge:", rechargeError);
      return new Response("fail", { status: 500 });
    }

    console.log("Payment success for order:", outTradeNo);
    return new Response("success");
    
  } catch (error) {
    console.error("Error processing epay notify:", error);
    return new Response("fail", { status: 500 });
  }
});
