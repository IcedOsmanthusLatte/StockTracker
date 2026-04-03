'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, BarChart3, Sparkles, RefreshCw } from 'lucide-react';
import AnalysisDisplay from '@/components/AnalysisDisplay';

interface Stock {
  id: number;
  symbol: string;
  name: string;
  portfolio_weight: number;
  display_order: number;
}

interface StockAnalysis {
  analysis: string;
  analyzedAt: string;
  cached?: boolean;
}

export default function BerkshireTab() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());
  const [analyses, setAnalyses] = useState<Map<string, StockAnalysis>>(new Map());

  useEffect(() => {
    fetchBerkshireHoldings();
  }, []);

  const fetchBerkshireHoldings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/berkshire');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            onClick={fetchBerkshireHoldings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">伯克希尔·哈撒韦前十大持仓</h1>
            <p className="text-gray-600 mt-1">Berkshire Hathaway Top 10 Holdings (Q4 2025)</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-start gap-4">
            <BarChart3 className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">关于持仓数据</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                以下数据基于伯克希尔·哈撒韦2025年第四季度13F报告（截至2025年12月31日）。
                投资组合总价值约$274.16B，前十大持仓占比约88%。数据每日自动更新AI分析。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="space-y-4">
        {stocks.map((stock, index) => (
          <div
            key={stock.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Rank Badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                    'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700'
                  }`}>
                    #{index + 1}
                  </div>

                  {/* Stock Info */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{stock.name}</h2>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        {stock.symbol}
                      </span>
                    </div>

                    {/* Portfolio Weight */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">持仓占比</span>
                        <span className="text-lg font-bold text-blue-600">
                          {stock.portfolio_weight?.toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(stock.portfolio_weight || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* AI Analysis Button */}
                    <button
                      onClick={() => analyzeStock(stock.symbol)}
                      disabled={analyzing.has(stock.symbol)}
                      className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 font-medium"
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
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>数据来源：Berkshire Hathaway 13F Filing | 更新时间：2025年Q4</p>
        <p className="mt-1">投资有风险，以上信息仅供参考，不构成投资建议</p>
      </div>
    </div>
  );
}
