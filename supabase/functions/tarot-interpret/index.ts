// Supabase Edge Function: tarot-interpret
// 代理调用硅基流动 AI API，保护 API Key 不暴露给前端

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 从 Supabase Secrets 获取 API Key
const SILICONFLOW_API_KEY = Deno.env.get('SILICONFLOW_API_KEY') || ''
const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions'
const MODEL_NAME = 'deepseek-ai/DeepSeek-V3'

interface TarotCard {
  name: string
  nameEn: string
  desc: string
  descEn: string
  isUpright: boolean
}

interface RequestBody {
  spreadName: string
  question: string
  cards: TarotCard[]
  positions: string[]
  lang: 'zh' | 'en'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 验证用户身份（可选但推荐）
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 验证 Supabase JWT token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 解析请求体
    const { spreadName, question, cards, positions, lang = 'zh' }: RequestBody = await req.json()

    if (!cards || cards.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No cards provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 构建 prompt
    let prompt = `你是一位神秘而智慧的塔罗牌解读师。请为用户解读以下牌阵。\n\n`
    prompt += `语言要求: ${lang === 'zh' ? '中文(简体)' : 'English'}。你必须用${lang === 'zh' ? '中文' : '英文'}回复。\n`
    prompt += `牌阵类型: ${spreadName}\n`
    prompt += `用户问题: ${question}\n\n`
    prompt += `抽取的牌:\n`

    cards.forEach((card, index) => {
      prompt += `${index + 1}. 位置: ${positions[index] || '通用'} - 牌: ${card.name} (${card.isUpright ? '正位' : '逆位'})\n`
      prompt += `   含义: ${card.desc}\n`
    })

    prompt += `\n请提供一个全面、富有同理心和神秘感的解读。重点关注牌与用户问题的联系。`
    prompt += `清晰地组织回复，为每个牌位提供解释，最后给出综合建议。`
    prompt += `\n\n格式要求：不要使用 Markdown 语法（不要用 * # ** 等符号），直接用纯文本分段即可。`

    // 调用硅基流动 API
    const aiResponse = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: 'system',
            content: '你是一位神秘而智慧的塔罗牌解读师，拥有深厚的塔罗知识和灵性洞察力。你的解读风格温和、富有同理心，同时充满神秘感。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    })

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({}))
      console.error('AI API Error:', aiResponse.status, errorData)
      return new Response(
        JSON.stringify({ error: 'AI service error', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const aiData = await aiResponse.json()
    
    if (aiData.choices && aiData.choices[0] && aiData.choices[0].message) {
      return new Response(
        JSON.stringify({ interpretation: aiData.choices[0].message.content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'No content in AI response' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
