'use client';

import { useEffect, useState } from 'react';
import { Heart, LogOut, Search, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import AnalysisDisplay from '@/components/AnalysisDisplay';

interface User {
  id: string;
  username: string;
}

interface WatchlistItem {
  id: string;
  stock_id: number;
  symbol: string;
  name: string;
  added_at: string;
}

interface StockAnalysis {
  analysis: string;
  analyzedAt: string;
  cached?: boolean;
}

interface SearchResult {
  id: number;
  symbol: string;
  name: string;
}

export default function WatchlistTab() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<Map<string, StockAnalysis>>(new Map());
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [hoveredStock, setHoveredStock] = useState<string | null>(null);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingStock, setAddingStock] = useState<string | null>(null); // 正在添加的股票symbol
  const [isUpdatingData, setIsUpdatingData] = useState(false); // 是否正在更新当日数据

  // 从localStorage加载用户信息
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 当用户登录后，加载关注列表
  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 加载关注列表
  const fetchWatchlist = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/watchlist?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setWatchlist(data.watchlist || []);
        // 自动加载所有股票的AI分析
        loadAnalysesForWatchlist(data.watchlist || []);
      }
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载关注列表中所有股票的AI分析
  const loadAnalysesForWatchlist = async (items: WatchlistItem[]) => {
    if (items.length === 0) return;
    
    setIsUpdatingData(true);
    setLoadingAnalyses(true);
    const analysisMap = new Map<string, StockAnalysis>();

    for (const item of items) {
      try {
        // 使用缓存数据，和其他Tab一样
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            symbol: item.symbol
          }),
        });

        if (response.ok) {
          const analysis: StockAnalysis = await response.json();
          analysisMap.set(item.symbol, analysis);
        }
      } catch (err) {
        console.error(`Failed to load analysis for ${item.symbol}:`, err);
      }
    }

    setAnalyses(analysisMap);
    setLoadingAnalyses(false);
    setIsUpdatingData(false);
  };

  // 登录/注册
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAuthError('请输入有效的邮箱地址');
      return;
    }

    // 注册时验证密码确认
    if (!isLogin) {
      if (password !== confirmPassword) {
        setAuthError('两次输入的密码不一致');
        return;
      }
      if (password.length < 6) {
        setAuthError('密码长度至少为6位');
        return;
      }
    }

    setAuthLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = { id: data.user.id, username: data.user.email };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setShowAuthModal(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setAuthError(data.error || '操作失败');
      }
    } catch (error) {
      setAuthError('网络错误，请稍后重试');
    } finally {
      setAuthLoading(false);
    }
  };

  // 登出
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setWatchlist([]);
    setAnalyses(new Map());
  };

  // AI搜索股票
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch('/api/stocks/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.stocks || []);
      } else {
        alert(data.error || 'AI搜索失败');
      }
    } catch (error) {
      console.error('AI search failed:', error);
      alert('AI搜索失败，请稍后重试');
    } finally {
      setSearching(false);
    }
  };

  // 添加到关注列表
  const handleAddToWatchlist = async (stock: SearchResult) => {
    if (!user) return;

    setAddingStock(stock.symbol); // 设置正在添加的股票
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          symbol: stock.symbol, 
          name: stock.name 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchWatchlist();
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
      } else {
        console.error('Add to watchlist failed:', data);
        alert(data.error || '添加失败');
      }
    } catch (error) {
      console.error('Add to watchlist error:', error);
      alert('添加失败，请稍后重试');
    } finally {
      setAddingStock(null); // 清除加载状态
    }
  };

  // 从关注列表删除
  const handleRemoveFromWatchlist = async (itemId: string) => {
    if (!user) return;

    if (!confirm('确定要删除这只股票吗？')) return;

    try {
      const response = await fetch(`/api/watchlist?id=${itemId}&userId=${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchWatchlist();
      } else {
        alert('删除失败');
      }
    } catch (error) {
      alert('删除失败，请稍后重试');
    }
  };


  // 获取市场标签
  const getMarketBadge = (symbol: string) => {
    if (symbol.includes('.SH') || symbol.includes('.SZ')) {
      return { label: 'A股', color: 'bg-red-100 text-red-700' };
    } else if (symbol.includes('.HK')) {
      return { label: '港股', color: 'bg-purple-100 text-purple-700' };
    } else {
      return { label: '美股', color: 'bg-blue-100 text-blue-700' };
    }
  };

  // 未登录状态
  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">我的关注</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          登录后可以添加最多5只自选股票，查看AI分析
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => { setIsLogin(true); setShowAuthModal(true); }}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
          >
            登录
          </button>
          <button
            onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            注册
          </button>
        </div>

        {/* 登录/注册弹窗 */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{isLogin ? '登录' : '注册'}</h3>
              <form onSubmit={handleAuth}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:text-gray-500 text-gray-900"
                    placeholder="请输入邮箱地址"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    密码
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:text-gray-500 text-gray-900"
                    placeholder="请输入密码（至少6位）"
                    required
                  />
                </div>
                {!isLogin && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      确认密码
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:text-gray-500 text-gray-900"
                      placeholder="请再次输入密码"
                      required
                    />
                  </div>
                )}
                {isLogin && <div className="mb-6"></div>}
                {authError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {authError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {authLoading ? '处理中...' : (isLogin ? '登录' : '注册')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    取消
                  </button>
                </div>
                <div className="mt-4 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-pink-600 hover:text-pink-700"
                  >
                    {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 已登录状态
  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">我的关注</h1>
            <p className="text-sm text-gray-600">欢迎，{user.username}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          登出
        </button>
      </div>

      {/* 数据更新提示 */}
      {isUpdatingData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">正在为您更新当日最新数据</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                我们正在实时获取您关注股票的最新市场信息和AI分析，这可能需要几分钟时间。您可以稍作休息，数据准备完成后会自动显示在下方。感谢您的耐心等待！
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                <span>正在更新 {watchlist.length} 只股票的数据...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout: Sidebar + Content */}
      {watchlist.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="text-center text-gray-500">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="mb-4">还没有添加股票</p>
            <button
              onClick={() => setShowSearch(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              添加股票
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Left Sidebar - Stock List */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    我的关注 ({watchlist.length}/5)
                  </h2>
                  {watchlist.length < 5 && (
                    <button
                      onClick={() => setShowSearch(true)}
                      className="p-1.5 text-pink-600 hover:bg-pink-100 rounded-lg transition-colors"
                      title="添加股票"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {watchlist.map((item) => {
                  const marketBadge = getMarketBadge(item.symbol);
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedStock(item.symbol)}
                      onMouseEnter={() => setHoveredStock(item.symbol)}
                      onMouseLeave={() => setHoveredStock(null)}
                      className={`w-full text-left p-4 transition-all duration-200 ${
                        selectedStock === item.symbol
                          ? 'bg-pink-50 border-l-4 border-pink-600'
                          : hoveredStock === item.symbol
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
                            selectedStock === item.symbol
                              ? 'text-pink-900 text-base'
                              : 'text-gray-900 text-sm'
                          }`}>
                            {item.name}
                          </div>
                          <div className={`text-xs font-medium mt-1 transition-all ${
                            selectedStock === item.symbol
                              ? 'text-pink-600'
                              : 'text-gray-500'
                          }`}>
                            {item.symbol}
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
            {selectedStock ? (
              <div className="space-y-6">
                {/* Stock Details Card */}
                {(() => {
                  const selectedItem = watchlist.find(item => item.symbol === selectedStock);
                  if (!selectedItem) return null;
                  const marketBadge = getMarketBadge(selectedItem.symbol);
                  
                  return (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          {/* Market Badge */}
                          <div className={`px-4 py-2 rounded-xl text-sm font-bold ${marketBadge.color}`}>
                            {marketBadge.label}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFromWatchlist(selectedItem.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Stock Info */}
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedItem.name}</h2>
                        <div className="flex items-center gap-3">
                          <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium">
                            {selectedItem.symbol}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* AI Analysis Card */}
                {selectedStock && analyses.has(selectedStock) ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Heart className="w-6 h-6 text-pink-600" />
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
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
                      <span>加载AI分析中...</span>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
                <div className="text-center text-gray-500">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>请从左侧选择一只股票查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 搜索弹窗 */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">搜索股票</h3>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:text-gray-500 text-gray-900"
                placeholder="输入股票代码或名称"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                {searching ? '搜索中...' : '搜索'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((stock) => (
                  <div
                    key={stock.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{stock.name}</div>
                      <div className="text-sm text-gray-600">{stock.symbol}</div>
                    </div>
                    <button
                      onClick={() => handleAddToWatchlist(stock)}
                      disabled={addingStock === stock.symbol}
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingStock === stock.symbol ? '添加中...' : '添加'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !searching && (
              <div className="text-center py-12 text-gray-600">
                没有找到相关股票
              </div>
            )}
          </div>
        </div>
      )}

      {/* 底部提示 */}
      <div className="text-center text-sm text-gray-500">
        <p>数据来源：实时市场数据 | AI分析：xAI Grok</p>
        <p className="mt-1">每天早上10点自动更新AI分析缓存</p>
      </div>
    </div>
  );
}
