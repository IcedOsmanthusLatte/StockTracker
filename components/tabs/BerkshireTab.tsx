'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [analyses, setAnalyses] = useState<Map<string, StockAnalysis>>(new Map());
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [hoveredStock, setHoveredStock] = useState<string | null>(null);

  useEffect(() => {
    fetchBerkshireHoldings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBerkshireHoldings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/berkshire');
      if (!response.ok) throw new Error('获取数据失败');
      
      const data = await response.json();
      const stocksList = data.stocks || [];
      setStocks(stocksList);
      
      // 自动加载所有股票的缓存分析
      if (stocksList.length > 0) {
        loadCachedAnalyses(stocksList);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCachedAnalyses = async (stocksList: Stock[]) => {
    setLoadingAnalyses(true);
    const analysisMap = new Map<string, StockAnalysis>();

    for (const stock of stocksList) {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: stock.symbol }),
        });

        if (response.ok) {
          const analysis: StockAnalysis = await response.json();
          analysisMap.set(stock.symbol, analysis);
        }
      } catch (err) {
        console.error(`Failed to load analysis for ${stock.symbol}:`, err);
      }
    }

    setAnalyses(analysisMap);
    setLoadingAnalyses(false);
    
    // 只有在用户还没有选择时，才默认选中第一只股票
    setSelectedStock(prev => {
      if (prev === null && stocksList.length > 0) {
        return stocksList[0].symbol;
      }
      return prev;
    });
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

  const selectedStockData = stocks.find(s => s.symbol === selectedStock);
  const selectedStockIndex = stocks.findIndex(s => s.symbol === selectedStock);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">伯克希尔·哈撒韦前十大持仓</h1>
            <p className="text-sm text-gray-600">Berkshire Hathaway Top 10 Holdings (Q4 2025)</p>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex gap-6">
        {/* Left Sidebar - Stock List */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                持仓列表
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {stocks.map((stock, index) => (
                <button
                  key={stock.id}
                  onClick={() => setSelectedStock(stock.symbol)}
                  onMouseEnter={() => setHoveredStock(stock.symbol)}
                  onMouseLeave={() => setHoveredStock(null)}
                  className={`w-full text-left p-4 transition-all duration-200 ${
                    selectedStock === stock.symbol
                      ? 'bg-blue-50 border-l-4 border-blue-600'
                      : hoveredStock === stock.symbol
                      ? 'bg-gray-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Stock Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold truncate transition-all ${
                        selectedStock === stock.symbol
                          ? 'text-blue-900 text-base'
                          : 'text-gray-900 text-sm'
                      }`}>
                        {stock.name}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className={`text-xs font-medium transition-all ${
                          selectedStock === stock.symbol
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}>
                          {stock.symbol}
                        </span>
                        <span className={`text-xs font-bold transition-all ${
                          selectedStock === stock.symbol
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}>
                          {stock.portfolio_weight?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content - Stock Details & Analysis */}
        <div className="flex-1 min-w-0">
          {selectedStockData ? (
            <div className="space-y-6">
              {/* Stock Details Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-4 mb-6">
                  {/* Rank Badge */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg ${
                    selectedStockIndex === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                    selectedStockIndex === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                    selectedStockIndex === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                    'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700'
                  }`}>
                    #{selectedStockIndex + 1}
                  </div>

                  {/* Stock Info */}
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedStockData.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-medium">
                        {selectedStockData.symbol}
                      </span>
                      <span className="text-sm text-gray-500">美股</span>
                    </div>
                  </div>
                </div>

                {/* Portfolio Weight */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600 font-medium">持仓占比</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {selectedStockData.portfolio_weight?.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(selectedStockData.portfolio_weight || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* AI Analysis Card */}
              {selectedStock && analyses.has(selectedStock) ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    AI 投资分析
                  </h3>
                  <AnalysisDisplay
                    analysis={analyses.get(selectedStock)!.analysis}
                    analyzedAt={analyses.get(selectedStock)!.analyzedAt}
                  />
                </div>
              ) : loadingAnalyses ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <span>加载AI分析中...</span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>请从左侧选择一只股票查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>数据来源：Berkshire Hathaway 13F Filing | 更新时间：2025年Q4</p>
        <p className="mt-1">投资有风险，以上信息仅供参考，不构成投资建议</p>
      </div>
    </div>
  );
}
