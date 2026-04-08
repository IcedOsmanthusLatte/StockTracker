'use client';

import { useEffect, useState } from 'react';
import { Star, Globe } from 'lucide-react';
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
  const [analyses, setAnalyses] = useState<Map<string, StockAnalysis>>(new Map());
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [hoveredStock, setHoveredStock] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFeaturedStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/featured');
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

  const selectedStockData = stocks.find(s => s.symbol === selectedStock);
  const selectedStockIndex = stocks.findIndex(s => s.symbol === selectedStock);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">特别关注</h1>
            <p className="text-sm text-gray-600">精选A股、港股、美股优质标的</p>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex gap-6">
        {/* Left Sidebar - Stock List */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-yellow-600" />
                股票列表
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {stocks.map((stock, index) => {
                const marketBadge = getMarketBadge(stock.symbol);
                return (
                  <button
                    key={stock.id}
                    onClick={() => setSelectedStock(stock.symbol)}
                    onMouseEnter={() => setHoveredStock(stock.symbol)}
                    onMouseLeave={() => setHoveredStock(null)}
                    className={`w-full text-left p-4 transition-all duration-200 ${
                      selectedStock === stock.symbol
                        ? 'bg-yellow-50 border-l-4 border-yellow-600'
                        : hoveredStock === stock.symbol
                        ? 'bg-gray-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Market Badge */}
                      <div className={`px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${marketBadge.color}`}>
                        {marketBadge.label}
                      </div>

                      {/* Stock Info */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold truncate transition-all ${
                          selectedStock === stock.symbol
                            ? 'text-yellow-900 text-base'
                            : 'text-gray-900 text-sm'
                        }`}>
                          {stock.name}
                        </div>
                        <div className={`text-xs font-medium mt-1 transition-all ${
                          selectedStock === stock.symbol
                            ? 'text-yellow-600'
                            : 'text-gray-500'
                        }`}>
                          {stock.symbol}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content - Stock Details & Analysis */}
        <div className="flex-1 min-w-0">
          {selectedStockData ? (
            <div className="space-y-6">
              {/* Stock Details Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-4 mb-4">
                  {/* Market Badge */}
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold ${getMarketBadge(selectedStockData.symbol).color}`}>
                    {getMarketBadge(selectedStockData.symbol).label}
                  </div>
                </div>

                {/* Stock Info */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedStockData.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium">
                      {selectedStockData.symbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Analysis Card */}
              {selectedStock && analyses.has(selectedStock) ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-600" />
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mb-4"></div>
                    <span>加载AI分析中...</span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
              <div className="text-center text-gray-500">
                <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>请从左侧选择一只股票查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>数据来源：实时市场数据 | AI分析：xAI Grok</p>
        <p className="mt-1">投资有风险，以上信息仅供参考，不构成投资建议</p>
      </div>
    </div>
  );
}
