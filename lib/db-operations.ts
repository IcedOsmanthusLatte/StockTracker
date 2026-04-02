import { supabase, Stock, StockAnalysis } from './supabase';

// 获取所有股票
export async function getAllStocks(): Promise<Stock[]> {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return [];
  }
  
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .order('symbol');
  
  if (error) {
    console.error('Error fetching stocks:', error);
    return [];
  }
  
  return data || [];
}

// 根据 symbol 获取股票
export async function getStockBySymbol(symbol: string): Promise<Stock | null> {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return null;
  }
  
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('symbol', symbol)
    .single();
  
  if (error) {
    console.error('Error fetching stock:', error);
    return null;
  }
  
  return data;
}

// 保存股票分析
export async function saveStockAnalysis(
  stockId: number,
  symbol: string,
  analysis: string,
  analyzedAt: string
): Promise<StockAnalysis | null> {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return null;
  }
  
  const { data, error } = await supabase
    .from('stock_analyses')
    .insert({
      stock_id: stockId,
      symbol,
      analysis,
      analyzed_at: analyzedAt
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving analysis:', error);
    return null;
  }
  
  return data;
}

// 获取最新的股票分析（24小时内）
export async function getLatestAnalysis(symbol: string): Promise<StockAnalysis | null> {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return null;
  }
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('stock_analyses')
    .select('*')
    .eq('symbol', symbol)
    .gte('analyzed_at', twentyFourHoursAgo)
    .order('analyzed_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    // 没有找到缓存的分析，返回 null
    return null;
  }
  
  return data;
}

// 获取用户订阅的股票
export async function getUserStocks(userId: string): Promise<Stock[]> {
  const { data, error } = await supabase
    .from('user_stocks')
    .select(`
      stock_id,
      stocks (*)
    `)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching user stocks:', error);
    return [];
  }
  
  return data?.map(item => (item as any).stocks) || [];
}

// 添加用户订阅股票
export async function addUserStock(userId: string, stockId: number): Promise<boolean> {
  const { error } = await supabase
    .from('user_stocks')
    .insert({
      user_id: userId,
      stock_id: stockId
    });
  
  if (error) {
    console.error('Error adding user stock:', error);
    return false;
  }
  
  return true;
}

// 删除用户订阅股票
export async function removeUserStock(userId: string, stockId: number): Promise<boolean> {
  const { error } = await supabase
    .from('user_stocks')
    .delete()
    .eq('user_id', userId)
    .eq('stock_id', stockId);
  
  if (error) {
    console.error('Error removing user stock:', error);
    return false;
  }
  
  return true;
}
