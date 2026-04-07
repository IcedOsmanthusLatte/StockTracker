'use client';

import { useEffect, useState } from 'react';
import { Star, Globe, Sparkles, RefreshCw } from 'lucide-react';
import AnalysisDisplay from '@/components/AnalysisDisplay';

interface Stock {
  id: number;
  symbol: string;
  name: string;
  display_order?: number;
}

interface StockAnalysis {
  analysis: string;
  analyzedAt: string;
  cached?: boolean;
}

export default function FeaturedTab() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());
  const [analyses, setAnalyses] = useState<Map<string, StockAnalysis>>(new Map());

  useEffect(() => {
    fetchFeaturedStocks();
  }, []);

  const fetchFeaturedStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/featured');
      if (!response.ok) throw new Error('获取数据失败');
      
      const data = await response.json();
      setStocks(data.stocks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const analyzeStock = async (symbol: string) => {
    if (analyzing.has(symbol)) return;

    setAnalyses(prev => {
      const next = new Map(prev);
      next.delete(symbol);
      return next;
    });
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

  const getMarketBadge = (symbol: string) => {
    if (symbol.includes('.SH') || symbol.includes('.SZ')) {
      return { label: 'A股', color: 'bg-red-100 text-red-700' };
    } else if (symbol.includes('.HK')) {
      return { label: '港股', color: 'bg-purple-100 text-purple-700' };
    } else {
      return { label: '美股', color: 'bg-blue-100 text-blue-700' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchFeaturedStocks}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">特别关注</h1>
            <p className="text-gray-600 mt-1">精选A股、港股、美股优质标的</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-start gap-4">
            <Globe className="w-6 h-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">关于特别关注</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                精选14只优质股票，覆盖A股、港股、美股三大市场。包含价值投资标的、行业龙头、优质ETF等。
                点击AI分析按钮获取实时智能分析。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stocks List */}
      <div className="space-y-4">
        {stocks.map((stock) => {
          const marketBadge = getMarketBadge(stock.symbol);
          return (
            <div
              key={stock.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{stock.name}</h2>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                        {stock.symbol}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${marketBadge.color}`}>
                        {marketBadge.label}
                      </span>
                    </div>

                    {/* AI Analysis Button */}
                    <button
                      onClick={() => analyzeStock(stock.symbol)}
                      disabled={analyzing.has(stock.symbol)}
                      className="mt-3 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-yellow-200 hover:shadow-xl hover:shadow-yellow-300 font-medium"
                    >
                      {analyzing.has(stock.symbol) ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          AI分析
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Analysis Display */}
                {analyses.has(stock.symbol) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <AnalysisDisplay
                      analysis={analyses.get(stock.symbol)!.analysis}
                      analyzedAt={analyses.get(stock.symbol)!.analyzedAt}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>数据来源：实时市场数据 | AI分析：xAI Grok</p>
        <p className="mt-1">投资有风险，以上信息仅供参考，不构成投资建议</p>
      </div>
    </div>
  );
}
