import { supabase, ReadingRecord } from './supabaseClient';
import { getCurrentUser } from './authService';
import type { Card, SpreadType } from '../types';

/**
 * 占卜记录服务
 */

export interface CreateReadingInput {
    spreadType: SpreadType;
    spreadName: string;
    question: string;
    cards: Card[];
    interpretation: string;
    language: 'zh' | 'en';
}

// 保存占卜记录
export const saveReading = async (input: CreateReadingInput): Promise<ReadingRecord | null> => {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('readings')
        .insert({
            user_id: user.id,
            spread_type: input.spreadType,
            spread_name: input.spreadName,
            question: input.question,
            cards: input.cards,
            interpretation: input.interpretation,
            language: input.language,
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving reading:', error);
        return null;
    }

    return data;
};

// 获取用户所有占卜记录
export const getReadings = async (): Promise<ReadingRecord[]> => {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('readings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching readings:', error);
        return [];
    }

    return data || [];
};

// 获取单条记录
export const getReadingById = async (id: string): Promise<ReadingRecord | null> => {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('readings')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching reading:', error);
        return null;
    }

    return data;
};

// 删除占卜记录
export const deleteReading = async (id: string): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) return false;

    const { error } = await supabase
        .from('readings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting reading:', error);
        return false;
    }

    return true;
};

// 转换数据库记录为前端 Reading 类型
export const toFrontendReading = (record: ReadingRecord) => ({
    id: record.id,
    date: record.created_at,
    spreadType: record.spread_type as SpreadType,
    spreadName: record.spread_name,
    question: record.question || '',
    cards: record.cards as Card[],
    interpretation: record.interpretation,
    language: record.language as 'zh' | 'en',
});
