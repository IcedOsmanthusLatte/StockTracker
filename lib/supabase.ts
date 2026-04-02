import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 只在有环境变量时创建客户端
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

// 数据库类型定义
export interface Stock {
  id: number;
  symbol: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface StockAnalysis {
  id: number;
  stock_id: number;
  symbol: string;
  analysis: string;
  analyzed_at: string;
  created_at: string;
}

export interface UserStock {
  id: number;
  user_id: string;
  stock_id: number;
  created_at: string;
}
