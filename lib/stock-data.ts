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

const MOCK_STOCKS: Record<string, Omit<StockData, 'lastUpdated'>> = {
  '600519': {
    symbol: '600519',
    name: '贵州茅台',
    price: 1685.50,
    change: 0.85,
    volume: 1250000,
    pe: 32.5,
    high52w: 2100.00,
    low52w: 1520.00,
  },
  '600519.SH': {
    symbol: '600519.SH',
    name: '贵州茅台',
    price: 1685.50,
    change: 0.85,
    volume: 1250000,
    pe: 32.5,
    high52w: 2100.00,
    low52w: 1520.00,
  },
  '000858': {
    symbol: '000858',
    name: '五粮液',
    price: 145.80,
    change: 1.25,
    volume: 3200000,
    pe: 28.3,
    high52w: 185.00,
    low52w: 130.00,
  },
  '601318': {
    symbol: '601318',
    name: '中国平安',
    price: 42.50,
    change: -0.35,
    volume: 8500000,
    pe: 9.2,
    high52w: 58.00,
    low52w: 38.00,
  },
  '600036': {
    symbol: '600036',
    name: '招商银行',
    price: 35.20,
    change: 0.57,
    volume: 6800000,
    pe: 6.8,
    high52w: 42.00,
    low52w: 30.00,
  },
  '000333': {
    symbol: '000333',
    name: '美的集团',
    price: 58.90,
    change: 1.15,
    volume: 4200000,
    pe: 12.5,
    high52w: 75.00,
    low52w: 52.00,
  },
  '002415.SZ': {
    symbol: '002415.SZ',
    name: '海康威视',
    price: 38.45,
    change: -0.52,
    volume: 8500000,
    pe: 18.2,
    high52w: 45.80,
    low52w: 32.10,
  },
  '159941.SZ': {
    symbol: '159941.SZ',
    name: '纳指ETF广发',
    price: 1.245,
    change: 1.15,
    volume: 125000000,
    pe: undefined,
    high52w: 1.380,
    low52w: 1.050,
  },
  '000426.SZ': {
    symbol: '000426.SZ',
    name: '兴业银锡',
    price: 12.85,
    change: -1.23,
    volume: 3200000,
    pe: 8.5,
    high52w: 15.60,
    low52w: 11.20,
  },
  '01712.HK': {
    symbol: '01712.HK',
    name: '龙资源',
    price: 2.35,
    change: 2.18,
    volume: 15000000,
    pe: 12.3,
    high52w: 3.80,
    low52w: 1.95,
  },
  '2233.HK': {
    symbol: '2233.HK',
    name: '西部水泥',
    price: 0.88,
    change: -0.56,
    volume: 42000000,
    pe: 5.2,
    high52w: 1.25,
    low52w: 0.72,
  },
  '0883.HK': {
    symbol: '0883.HK',
    name: '中国海洋石油',
    price: 18.25,
    change: 1.67,
    volume: 28000000,
    pe: 7.8,
    high52w: 21.50,
    low52w: 15.80,
  },
  'NYSEARCA:VTV': {
    symbol: 'NYSEARCA:VTV',
    name: 'VTV',
    price: 168.45,
    change: 0.35,
    volume: 2100000,
    pe: undefined,
    high52w: 175.20,
    low52w: 152.30,
  },
  'NASDAQ:PDD': {
    symbol: 'NASDAQ:PDD',
    name: '拼多多',
    price: 125.80,
    change: -2.15,
    volume: 8900000,
    pe: 15.6,
    high52w: 165.50,
    low52w: 88.20,
  },
};

export async function getStockData(symbol: string): Promise<StockData | null> {
  const mockData = MOCK_STOCKS[symbol.toUpperCase()];
  
  if (!mockData) {
    return null;
  }

  const randomChange = (Math.random() - 0.5) * 0.5;
  
  return {
    ...mockData,
    price: mockData.price * (1 + randomChange / 100),
    change: mockData.change + randomChange,
    lastUpdated: new Date().toISOString(),
  };
}

export async function getMultipleStocks(symbols: string[]): Promise<StockData[]> {
  const promises = symbols.map(symbol => getStockData(symbol));
  const results = await Promise.all(promises);
  return results.filter((data): data is StockData => data !== null);
}

export function getAvailableStocks(): string[] {
  return Object.keys(MOCK_STOCKS);
}

export function searchStocks(query: string): StockData[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(MOCK_STOCKS)
    .filter(stock => 
      stock.symbol.toLowerCase().includes(lowerQuery) ||
      stock.name.toLowerCase().includes(lowerQuery)
    )
    .map(stock => ({
      ...stock,
      lastUpdated: new Date().toISOString(),
    }));
}
