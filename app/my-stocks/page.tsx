'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Loader2, Plus, X, ArrowLeft, Sparkles, Search } from 'lucide-react';
import { StockData, StockAnalysis } from '@/lib/stock-data';

export default function MyStocksPage() {
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, StockAnalysis>>(new Map());
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      if (!response.ok) throw new Error('获取订阅失败');
      const data = await response.json();
      setSubscriptions(data.subscriptions);
      
      if (data.subscriptions.length > 0) {
        const stockPromises = data.subscriptions.map((symbol: string) =>
          fetch(`/api/stocks?symbol=${symbol}`).then(r => r.json())
        );
        const stocksData = await Promise.all(stockPromises);
        setStocks(stocksData.filter(s => !s.error));
      }
    } catch (err) {
      console.error('Fetch subscriptions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSubscription = async (symbol: string) => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      if (!response.ok) throw new Error('添加订阅失败');
      await fetchSubscriptions();
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Add subscription error:', err);
    }
  };

  const removeSubscription = async (symbol: string) => {
    try {
      const response = await fetch(`/api/subscriptions?symbol=${symbol}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('删除订阅失败');
      await fetchSubscriptions();
    } catch (err) {
      console.error('Remove subscription error:', err);
    }
  };

  const searchStocks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/stocks?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('搜索失败');
      const data = await response.json();
      setSearchResults(data.stocks || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const analyzeStock = async (symbol: string) => {
    if (analyzing.has(symbol)) return;

    setAnalyzing(prev => new Set(prev).add(symbol));
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });

      if (!response.ok) throw new Error('分析失败');
      const analysis: StockAnalysis = await response.json();
      
      setAnalyses(prev => new Map(prev).set(symbol, analysis));
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(prev => {
        const next = new Set(prev);
        next.delete(symbol);
        return next;
      });
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchStocks(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StockTracker
              </span>
            </Link>
            <div className="flex gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </Link>
              <Link
                href="/public-list"
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                公开列表
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">我的股票订阅</h1>
          <p className="text-gray-600">管理您的个人股票追踪列表</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">添加股票</h2>
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索股票代码或名称 (如: AAPL, 苹果)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {searching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto" />
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => addSubscription(stock.symbol)}
                    disabled={subscriptions.includes(stock.symbol)}
                    className="w-full px-4 py-3 hover:bg-gray-50 flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed border-b last:border-b-0"
                  >
                    <div className="text-left">
                      <div className="font-semibold">{stock.name}</div>
                      <div className="text-sm text-gray-500">{stock.symbol}</div>
                    </div>
                    {subscriptions.includes(stock.symbol) ? (
                      <span className="text-sm text-gray-500">已订阅</span>
                    ) : (
                      <Plus className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {stocks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">还没有订阅任何股票</h3>
            <p className="text-gray-500">使用上方搜索框添加您感兴趣的股票</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {stocks.map((stock) => (
              <div key={stock.symbol} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
                <div className="p-8">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-gray-900">{stock.name}</h2>
                        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100">
                          {stock.symbol}
                        </span>
                      </div>
                      <p className="text-gray-500 mt-2">点击AI分析获取最新实时数据</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => analyzeStock(stock.symbol)}
                        disabled={analyzing.has(stock.symbol)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 font-medium"
                      >
                        {analyzing.has(stock.symbol) ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>分析中...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            <span>AI分析</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => removeSubscription(stock.symbol)}
                        className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                        title="取消订阅"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {analyses.has(stock.symbol) && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">AI分析报告</h3>
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                        {analyses.get(stock.symbol)?.analysis}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        分析时间: {new Date(analyses.get(stock.symbol)!.analyzedAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
