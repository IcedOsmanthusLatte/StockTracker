import { supabase, StockAnalysis } from './supabase';

/**
 * 获取中国时间的今天日期字符串 (YYYY-MM-DD)
 */
export function getChinaDateString(): string {
  const now = new Date();
  // 转换为中国时区 (UTC+8)
  const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  const year = chinaTime.getUTCFullYear();
  const month = String(chinaTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(chinaTime.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取当天的缓存分析（基于中国时间）
 */
export async function getTodayCache(symbol: string): Promise<StockAnalysis | null> {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return null;
  }

  const todayDate = getChinaDateString();
  
  const { data, error } = await supabase
    .from('stock_analyses')
    .select('*')
    .eq('symbol', symbol)
    .eq('analysis_date', todayDate)
    .order('analyzed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching today cache:', error);
    return null;
  }
  
  return data;
}

/**
 * 保存或更新当天的分析缓存
 * 如果当天已有缓存，则更新；否则插入新记录
 */
export async function saveTodayCache(
  stockId: number,
  symbol: string,
  analysis: string
): Promise<StockAnalysis | null> {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return null;
  }

  const todayDate = getChinaDateString();
  const analyzedAt = new Date().toISOString();

  // 先检查今天是否已有缓存
  const existingCache = await getTodayCache(symbol);

  if (existingCache) {
    // 更新现有缓存
    const { data, error } = await supabase
      .from('stock_analyses')
      .update({
        analysis,
        analyzed_at: analyzedAt
      })
      .eq('id', existingCache.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating cache:', error);
      return null;
    }

    console.log(`[Cache] 更新了 ${symbol} 的当天缓存`);
    return data;
  } else {
    // 插入新缓存
    const { data, error } = await supabase
      .from('stock_analyses')
      .insert({
        stock_id: stockId,
        symbol,
        analysis,
        analyzed_at: analyzedAt,
        analysis_date: todayDate
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving cache:', error);
      return null;
    }

    console.log(`[Cache] 创建了 ${symbol} 的当天缓存`);
    return data;
  }
}

/**
 * 带重试的AI分析函数
 * @param analyzeFunction - 执行分析的函数
 * @param maxRetries - 最大重试次数（默认3次）
 */
export async function analyzeWithRetry<T>(
  analyzeFunction: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Retry] 尝试分析 (第 ${attempt}/${maxRetries} 次)`);
      const result = await analyzeFunction();
      if (attempt > 1) {
        console.log(`[Retry] 重试成功！`);
      }
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[Retry] 第 ${attempt} 次尝试失败:`, lastError.message);
      
      if (attempt < maxRetries) {
        // 等待一段时间后重试（指数退避）
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`[Retry] 等待 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.error(`[Retry] 所有重试均失败`);
  throw lastError || new Error('分析失败');
}
