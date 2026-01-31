import { Card } from "../types";
import { supabase } from "./supabaseClient";

// Supabase Edge Function URL
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tarot-interpret`;

export const getDeepSeekInterpretation = async (
    spreadName: string,
    question: string,
    cards: Card[],
    positions: string[],
    lang: 'zh' | 'en' = 'zh'
): Promise<string> => {
    try {
        // 获取当前用户的 session token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            console.warn("User not logged in. Returning mock response.");
            return generateMockReading(spreadName, question, cards, positions, lang, lang === 'zh' ? "请先登录" : "Please login first");
        }

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                spreadName,
                question,
                cards,
                positions,
                lang
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Edge Function Error:", response.status, errorData);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.interpretation) {
            return data.interpretation;
        }
        
        throw new Error(data.error || "No interpretation in response");

    } catch (error) {
        console.error("AI Interpretation Error:", error);
        const errorNote = lang === 'zh' ? "星辰连接受阻，启用应急预言" : "Connection interrupted, using backup oracle";
        return generateMockReading(spreadName, question, cards, positions, lang, errorNote);
    }
};

// Fallback function to generate a reading locally when API fails
const generateMockReading = (
    spreadName: string,
    question: string,
    cards: Card[],
    positions: string[],
    lang: 'zh' | 'en',
    note: string
): string => {
    if (lang === 'zh') {
        let reading = `(${note}) \n\n`;
        reading += `针对您的问题"${question || '无具体问题'}"，${spreadName}显示了以下指引：\n\n`;

        cards.forEach((card, index) => {
            const position = positions[index] || `位置 ${index + 1}`;
            const orientation = card.isUpright ? '正位' : '逆位';
            reading += `【${position}】${card.name} (${orientation})\n`;
            reading += `此牌象征着：${card.desc}。\n在此位置上，它提示您：当下的能量正处于一种微妙的平衡中，${card.name}的力量将帮助您看清迷雾背后的真相。\n\n`;
        });

        reading += `【综合启示】\n命运的齿轮正在转动。牌面整体显示出一种积极转化的趋势。请相信您的直觉，顺应宇宙的能量流动，答案就在您的内心深处。`;
        return reading;
    } else {
        let reading = `(${note}) \n\n`;
        reading += `For your question "${question || 'General Guidance'}", the ${spreadName} reveals the following:\n\n`;

        cards.forEach((card, index) => {
            const position = positions[index] || `Position ${index + 1}`;
            const orientation = card.isUpright ? 'Upright' : 'Reversed';
            reading += `[${position}] ${card.nameEn} (${orientation})\n`;
            reading += `Symbolism: ${card.descEn}.\nGuidance: The energy is shifting. The power of ${card.nameEn} will help you see the truth behind the mist.\n\n`;
        });

        reading += `[Synthesis]\nThe wheels of fate are turning. Trust your intuition and flow with the cosmic energy. The answer lies within you.`;
        return reading;
    }
};
