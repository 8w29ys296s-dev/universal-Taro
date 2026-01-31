import { GoogleGenAI } from "@google/genai";
import { Card } from "../types";

// vite.config.ts 已通过 define 注入 process.env.GEMINI_API_KEY
const API_KEY = (process.env.GEMINI_API_KEY || process.env.API_KEY || '') as string;

export const getTarotInterpretation = async (
  spreadName: string,
  question: string,
  cards: Card[],
  positions: string[],
  lang: 'zh' | 'en' = 'zh'
): Promise<string> => {
  // If no API key is present, return a mock response immediately
  if (!API_KEY) {
    console.warn("Gemini API Key missing. Returning mock response.");
    return generateMockReading(spreadName, question, cards, positions, lang, lang === 'zh' ? "API Key 未配置" : "API Key Missing");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    let prompt = `You are a mystical and wise Tarot Reader. Interpret the following spread for the user.\n\n`;
    prompt += `Language Requirement: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}. YOU MUST REPLY IN ${lang === 'zh' ? 'CHINESE' : 'ENGLISH'}.\n`;
    prompt += `Spread Type: ${spreadName}\n`;
    prompt += `User Question: ${question}\n\n`;
    prompt += `Cards Drawn:\n`;

    cards.forEach((card, index) => {
      prompt += `${index + 1}. Position: ${positions[index] || 'General'} - Card: ${card.nameEn} (${card.isUpright ? 'Upright' : 'Reversed'})\n`;
      prompt += `   Meaning: ${card.descEn}\n`;
    });

    if (lang === 'zh') {
      prompt += `\nPlease provide a comprehensive, empathetic, and mystical interpretation in Chinese (Simplified). Focus on the connection between the cards and the user's question. Structure the response clearly with sections for each card position and a final synthesis/advice.`;
    } else {
      prompt += `\nPlease provide a comprehensive, empathetic, and mystical interpretation in English. Focus on the connection between the cards and the user's question. Structure the response clearly with sections for each card position and a final synthesis/advice.`;
    }

    // IMPORTANT: Instruction to avoid markdown symbols
    prompt += `\n\nIMPORTANT FORMATTING RULES:\n1. Do NOT use any Markdown syntax (no asterisks *, no hashes #, no bold syntax, no headers syntax).\n2. Use simple paragraph breaks.\n3. You MAY use HTML <br> tags for line breaks if necessary, but keep the text clean.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        responseMimeType: 'text/plain',
      }
    });

    if (response.text) {
      return response.text;
    }

    throw new Error("No text in response");

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a high-quality mock reading so the user experience isn't broken
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
    reading += `针对您的问题“${question || '无具体问题'}”，${spreadName}显示了以下指引：\n\n`;

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