'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Loader2, RefreshCw, ArrowLeft, Sparkles } from 'lucide-react';
import { StockData, StockAnalysis } from '@/lib/stock-data';
import AnalysisDisplay from '@/components/AnalysisDisplay';

export default function PublicListPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, StockAnalysis>>(new Map());
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [analysisErrors, setAnalysisErrors] = useState<Map<string, string>>(new Map());

  const fetchPublicList = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/public-list');
      if (!response.ok) throw new Error('获取公开列表失败');
      const data = await response.json();
      setStocks(data.stocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const analyzeStock = async (symbol: string) => {
    if (analyzing.has(symbol)) return;

    // 清除该股票的旧分析结果和错误信息，确保显示最新数据
    setAnalyses(prev => {
      const next = new Map(prev);
      next.delete(symbol);
      return next;
    });
    setAnalysisErrors(prev => {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '分析失败' }));
        throw new Error(errorData.error || '分析失败');
      }
      
      const analysis: StockAnalysis = await response.json();
      setAnalyses(prev => new Map(prev).set(symbol, analysis));
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMsg = err instanceof Error ? err.message : '分析失败，请重试';
      setAnalysisErrors(prev => new Map(prev).set(symbol, errorMsg));
    } finally {
      setAnalyzing(prev => {
        const next = new Set(prev);
        next.delete(symbol);
        return next;
      });
    }
  };

  useEffect(() => {
    fetchPublicList();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                StockTracker
              </span>
            </Link>
            <div className="flex gap-6 items-center">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </Link>
              <Link
                href="/my-stocks"
                className="px-6 py-2.5 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-all font-semibold shadow-sm"
              >
                我的订阅
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-3 text-gray-900">公开股票追踪列表</h1>
            <p className="text-xl text-gray-600">每日更新的AI分析报告</p>
          </div>
          <button
            onClick={fetchPublicList}
            className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all flex items-center gap-2 text-gray-700 font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            刷新数据
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {stocks.map((stock) => (
            <div key={stock.symbol} className="bg-white rounded-2xl border border-gray-200 hover:border-violet-300 hover:shadow-lg transition-all overflow-hidden">
              <div className="p-10">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h2 className="text-4xl font-bold text-gray-900">{stock.name}</h2>
                      <span className="px-4 py-2 bg-violet-50 text-violet-700 rounded-xl text-sm font-semibold border border-violet-100">
                        {stock.symbol}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-3 text-lg">点击AI分析获取最新实时数据</p>
                  </div>
                  <button
                    onClick={() => analyzeStock(stock.symbol)}
                    disabled={analyzing.has(stock.symbol)}
                    className="px-8 py-4 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg shadow-violet-600/20 font-semibold text-lg"
                  >
                    {analyzing.has(stock.symbol) ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>分析中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        <span>AI分析</span>
                      </>
                    )}
                  </button>
                </div>

                {analysisErrors.has(stock.symbol) && (
                  <div className="mt-6 p-6 bg-red-50 rounded-2xl border border-red-200">
                    <div className="flex items-center justify-between">
                      <p className="text-red-700 text-lg">
                        ❌ {analysisErrors.get(stock.symbol)}
                      </p>
                      <button
                        onClick={() => analyzeStock(stock.symbol)}
                        className="px-5 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium border border-red-200"
                      >
                        重试
                      </button>
                    </div>
                  </div>
                )}

                {analyses.has(stock.symbol) && (
                  <AnalysisDisplay 
                    analysis={analyses.get(stock.symbol)!.analysis}
                    analyzedAt={analyses.get(stock.symbol)!.analyzedAt}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
