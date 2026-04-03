'use client';

import { Heart } from 'lucide-react';

export default function WatchlistTab() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Heart className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">我的关注</h2>
      <p className="text-gray-600 max-w-md mx-auto">
        添加您关注的股票（最多5只），手动触发AI分析
      </p>
      <div className="mt-8 text-sm text-gray-500">
        即将上线...
      </div>
    </div>
  );
}
