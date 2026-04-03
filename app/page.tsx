'use client';

import { useState } from 'react';
import { TrendingUp, Star, Heart, Mail } from 'lucide-react';
import BerkshireTab from '@/components/tabs/BerkshireTab';
import FeaturedTab from '@/components/tabs/FeaturedTab';
import WatchlistTab from '@/components/tabs/WatchlistTab';
import ContactTab from '@/components/tabs/ContactTab';

type TabType = 'berkshire' | 'featured' | 'watchlist' | 'contact';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('berkshire');

  const tabs = [
    { id: 'berkshire' as TabType, label: '伯克希尔前十大持仓', icon: TrendingUp },
    { id: 'featured' as TabType, label: '特别关注', icon: Star },
    { id: 'watchlist' as TabType, label: '我的关注', icon: Heart },
    { id: 'contact' as TabType, label: '联系我们', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockTracker</span>
            </div>
            <div className="text-sm text-gray-600">
              AI驱动的智能股票分析平台
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-medium transition-all relative
                    ${
                      isActive
                        ? 'text-violet-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'berkshire' && <BerkshireTab />}
        {activeTab === 'featured' && <FeaturedTab />}
        {activeTab === 'watchlist' && <WatchlistTab />}
        {activeTab === 'contact' && <ContactTab />}
      </main>
    </div>
  );
}
