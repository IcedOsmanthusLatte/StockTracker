import Link from 'next/link';
import { TrendingUp, Users, Bell, Sparkles, ArrowRight, Zap, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                StockTracker
              </span>
            </div>
            <div className="flex gap-6 items-center">
              <Link
                href="/public-list"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                公开列表
              </Link>
              <Link
                href="/my-stocks"
                className="px-6 py-2.5 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-all font-semibold shadow-sm"
              >
                开始使用
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <main className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-100 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm text-violet-700 font-medium">AI驱动的智能分析</span>
            </div>
            
            <h1 className="text-7xl font-bold mb-8 text-gray-900 leading-tight tracking-tight">
              金融基础设施
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                助力投资增长
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              从第一笔交易到第十亿笔交易，利用AI技术实时分析股票走势，
              <br />
              为您提供专业的投资建议和个性化的追踪服务
            </p>
            
            <div className="flex gap-4 justify-center items-center">
              <Link
                href="/my-stocks"
                className="group px-8 py-4 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-all font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/20"
              >
                开始使用
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/public-list"
                className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all font-semibold"
              >
                查看公开分析
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <div className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-violet-300 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-violet-200 transition-colors">
                <Zap className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">实时AI分析</h3>
              <p className="text-gray-600 leading-relaxed">
                采用xAI Grok模型，实时搜索网络数据，深度分析股票走势，提供基于最新市场信息的专业投资见解
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">公开追踪</h3>
              <p className="text-gray-600 leading-relaxed">
                查看每日更新的公开股票分析列表，了解市场热点和专业观点，获取来自AI的深度洞察
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-200 transition-colors">
                <Shield className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">安全可靠</h3>
              <p className="text-gray-600 leading-relaxed">
                无需注册，使用Cookie技术本地保存您的偏好设置，保护您的隐私和数据安全
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-16 border border-violet-100 overflow-hidden">
            <div className="relative text-center">
              <h2 className="text-5xl font-bold mb-6 text-gray-900">
                开始您的智能投资之旅
              </h2>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                无需注册，即刻开始使用。体验AI驱动的股票分析，
                <br />
                让数据为您的投资决策保驾护航
              </p>
              <Link
                href="/my-stocks"
                className="group inline-flex items-center gap-3 px-10 py-5 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-all font-bold text-lg shadow-lg shadow-violet-600/20"
              >
                立即开始
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-24 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">StockTracker</span>
            </div>
            <p className="text-gray-600">© 2026 StockTracker. AI-Powered Stock Analysis Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
