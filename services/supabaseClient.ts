import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// 类型定义
export interface UserBalance {
  user_id: string;
  balance: number;
  total_recharge: number;
}

export interface UserSettings {
  id: string;
  music: boolean;
  haptic: boolean;
  notification: boolean;
  last_bonus_date: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'initial' | 'daily_bonus' | 'recharge' | 'consume' | 'refund';
  amount: number;
  recharge_value: number;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface ReadingRecord {
  id: string;
  user_id: string;
  spread_type: string;
  spread_name: string;
  question: string | null;
  cards: any[];
  interpretation: string;
  language: string;
  created_at: string;
}
