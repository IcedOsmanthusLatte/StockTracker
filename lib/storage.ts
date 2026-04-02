import { StockAnalysis } from './stock-data';

interface UserSubscription {
  userId: string;
  symbols: string[];
}

const publicStockList: string[] = ['600519.SH', '002415.SZ', '159941.SZ', '000426.SZ', '01712.HK', '2233.HK', '0883.HK', 'NYSEARCA:VTV', 'NASDAQ:PDD'];
const userSubscriptions = new Map<string, string[]>();
const analysisCache = new Map<string, StockAnalysis>();

export function getPublicStockList(): string[] {
  return [...publicStockList];
}

export function getUserSubscriptions(userId: string): string[] {
  return userSubscriptions.get(userId) || [];
}

export function addUserSubscription(userId: string, symbol: string): void {
  const current = userSubscriptions.get(userId) || [];
  if (!current.includes(symbol)) {
    userSubscriptions.set(userId, [...current, symbol]);
  }
}

export function removeUserSubscription(userId: string, symbol: string): void {
  const current = userSubscriptions.get(userId) || [];
  userSubscriptions.set(userId, current.filter(s => s !== symbol));
}

export function setUserSubscriptions(userId: string, symbols: string[]): void {
  userSubscriptions.set(userId, symbols);
}

export function cacheAnalysis(analysis: StockAnalysis): void {
  const key = `${analysis.symbol}_${new Date(analysis.analyzedAt).toDateString()}`;
  analysisCache.set(key, analysis);
}

export function getCachedAnalysis(symbol: string, date?: Date): StockAnalysis | null {
  const dateStr = (date || new Date()).toDateString();
  const key = `${symbol}_${dateStr}`;
  return analysisCache.get(key) || null;
}

export function clearOldCache(): void {
  const today = new Date().toDateString();
  const keysToDelete: string[] = [];
  
  analysisCache.forEach((_, key) => {
    if (!key.endsWith(today)) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => analysisCache.delete(key));
}
