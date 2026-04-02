export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  pe?: number;
  high52w?: number;
  low52w?: number;
  lastUpdated: string;
}

export interface StockAnalysis {
  symbol: string;
  name: string;
  data: StockData;
  analysis: string;
  analyzedAt: string;
}

// 模拟数据已移除 - 现在从数据库获取股票信息
// AI分析时会通过web_search工具获取实时股票数据

export async function getStockData(symbol: string): Promise<StockData | null> {
  // 返回基础股票信息，让AI通过web_search获取实时数据
  // 这里只提供占位数据，实际数据由AI搜索获取
  return {
    symbol: symbol,
    name: '股票名称将由AI搜索获取',
    price: 0,
    change: 0,
    volume: 0,
    pe: undefined,
    high52w: undefined,
    low52w: undefined,
    lastUpdated: new Date().toISOString(),
  };
}

export async function getMultipleStocks(symbols: string[]): Promise<StockData[]> {
  const promises = symbols.map((symbol: string) => getStockData(symbol));
  const results = await Promise.all(promises);
  return results.filter((data: StockData | null): data is StockData => data !== null);
}

export function getAvailableStocks(): string[] {
  // 可用股票列表现在从数据库获取
  return [];
}

export function searchStocks(query: string): StockData[] {
  // 股票搜索现在应该从数据库或真实API获取
  return [];
}
