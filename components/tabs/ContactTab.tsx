'use client';

import { Mail, Send } from 'lucide-react';

export default function ContactTab() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">联系我们</h2>
      </div>

      {/* 主要内容卡片 */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-6 text-base">
            我只是芒格的一名小小学生，希望用价值投资的理念跟踪分析一些股票。这个站点既是自用，也是免费分享给同样喜欢价值投资理念的朋友们使用。
          </p>
          <p className="text-gray-700 leading-relaxed text-base">
            如果你对站点有任何建议，对分析结果/逻辑有任何修改建议，请发邮件给我。
          </p>
        </div>

        {/* 邮箱联系区域 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">电子邮件</h3>
                <a
                  href="mailto:tangling2024@gmail.com"
                  className="text-violet-600 hover:text-violet-700 font-medium"
                >
                  tangling2024@gmail.com
                </a>
              </div>
            </div>
            <a
              href="mailto:tangling2024@gmail.com"
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>发送邮件</span>
            </a>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="text-center">
        <p className="text-sm text-gray-500 italic">
          期待与志同道合的价值投资者交流
        </p>
      </div>
    </div>
  );
}
