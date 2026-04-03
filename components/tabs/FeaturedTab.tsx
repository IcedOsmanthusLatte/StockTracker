'use client';

import { Star } from 'lucide-react';

export default function FeaturedTab() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Star className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">特别关注</h2>
      <p className="text-gray-600 max-w-md mx-auto">
        精选中国优质股票，每日AI分析更新
      </p>
      <div className="mt-8 text-sm text-gray-500">
        即将上线...
      </div>
    </div>
  );
}
