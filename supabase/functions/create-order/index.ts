import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import md5 from "https://esm.sh/blueimp-md5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 生成易支付签名
function generateSign(params: Record<string, string>, key: string): string {
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== "sign" && k !== "sign_type" && params[k] !== "")
    .sort();
  
  // 标准彩虹易支付签名：key1=value1&key2=value2...&key=商户密钥
  const stringA = sortedKeys.map((k) => `${k}=${params[k]}`).join("&");
  const signStr = stringA + "&key=" + key;
  return md5(signStr);
}

// 生成订单号
function generateOutTradeNo(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `TAROT${timestamp}${random}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 验证用户身份
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 初始化 Supabase 客户端
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // 用用户 token 获取用户信息
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 解析请求体
    const { itemId, amount, coins, bonus, payType } = await req.json();
    
    if (!amount || !coins) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 获取易支付配置
    const EPAY_PID = Deno.env.get("EPAY_PID");
    const EPAY_KEY = Deno.env.get("EPAY_KEY");
    const EPAY_API_URL = Deno.env.get("EPAY_API_URL") || "https://epay.jylc.cc/submit.php";
    const NOTIFY_URL = `${supabaseUrl}/functions/v1/epay-notify`;
    const RETURN_URL = Deno.env.get("EPAY_RETURN_URL") || "http://tarott.zeabur.app/#/payment/result";

    if (!EPAY_PID || !EPAY_KEY) {
      console.error("EPAY config not set");
      return new Response(
        JSON.stringify({ error: "Payment not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 生成订单号
    const outTradeNo = generateOutTradeNo();

    // 使用 service_role 创建订单记录
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error: insertError } = await supabaseAdmin
      .from("payment_orders")
      .insert({
        user_id: user.id,
        out_trade_no: outTradeNo,
        amount: amount,
        coins: coins,
        bonus: bonus || 0,
        pay_type: payType || "alipay",
      });

    if (insertError) {
      console.error("Failed to create order:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create order", detail: insertError.message, code: insertError.code }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 构建易支付请求参数
    const epayParams: Record<string, string> = {
      pid: EPAY_PID,
      type: payType || "alipay",
      out_trade_no: outTradeNo,
      notify_url: NOTIFY_URL,
      return_url: RETURN_URL,
      name: `塔罗金币充值 ${coins}币`,
      money: amount.toFixed(2),
    };

    // 生成签名
    const sign = await generateSign(epayParams, EPAY_KEY);
    epayParams.sign = sign;
    epayParams.sign_type = "MD5";

    // 构建跳转 URL
    const payUrl = `${EPAY_API_URL}?${new URLSearchParams(epayParams).toString()}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        payUrl,
        outTradeNo,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
