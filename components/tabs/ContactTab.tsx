'use client';

import { Mail, MessageCircle, Github } from 'lucide-react';

export default function ContactTab() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">联系我们</h2>
        <p className="text-gray-600">
          有任何问题或建议？欢迎与我们联系
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">电子邮件</h3>
              <p className="text-gray-600 text-sm mb-3">
                发送邮件至我们的官方邮箱
              </p>
              <a
                href="mailto:contact@stocktracker.com"
                className="text-violet-600 hover:text-violet-700 font-medium text-sm"
              >
                contact@stocktracker.com
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">在线反馈</h3>
              <p className="text-gray-600 text-sm mb-3">
                通过在线表单提交您的反馈和建议
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                提交反馈
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Github className="w-6 h-6 text-gray-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">GitHub</h3>
              <p className="text-gray-600 text-sm mb-3">
                查看我们的开源项目和贡献指南
              </p>
              <a
                href="https://github.com/IcedOsmanthusLatte/StockTracker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 font-medium text-sm"
              >
                访问 GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          我们通常会在24小时内回复您的消息
        </p>
      </div>
    </div>
  );
}
