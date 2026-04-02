'use client';

import { Sparkles, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface AnalysisDisplayProps {
  analysis: string;
  analyzedAt: string;
}

export default function AnalysisDisplay({ analysis, analyzedAt }: AnalysisDisplayProps) {
  // 使用新的分隔符提取各个部分
  const extractSection = (sectionNum: number): string => {
    const startMarker = `===SECTION_${sectionNum}_START===`;
    const endMarker = `===SECTION_${sectionNum}_END===`;
    
    const startIndex = analysis.indexOf(startMarker);
    const endIndex = analysis.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      return '';
    }
    
    // 提取标记之间的内容
    const content = analysis.substring(startIndex + startMarker.length, endIndex).trim();
    return content;
  };
  
  const priceSection = extractSection(1);
  const trendSection = extractSection(2);
  const newsSection = extractSection(3);
  const suggestionSection = extractSection(4);
  
  // 提取操作倾向关键词
  const suggestionMatch = suggestionSection.match(/(倾向于|略微倾向于|没有明显倾向|我不知道)(补仓|卖出)?/);
  const suggestion = suggestionMatch ? suggestionMatch[0] : '';
  
  // 判断倾向类型
  const getSuggestionStyle = () => {
    if (suggestion.includes('倾向于补仓')) return { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-700', icon: TrendingUp };
    if (suggestion.includes('略微倾向于补仓')) return { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-600', icon: TrendingUp };
    if (suggestion.includes('倾向于卖出')) return { bg: 'from-red-50 to-rose-50', border: 'border-red-200', text: 'text-red-700', icon: TrendingDown };
    if (suggestion.includes('略微倾向于卖出')) return { bg: 'from-red-50 to-rose-50', border: 'border-red-200', text: 'text-red-600', icon: TrendingDown };
    if (suggestion.includes('没有明显倾向')) return { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', text: 'text-blue-700', icon: CheckCircle };
    return { bg: 'from-gray-50 to-slate-50', border: 'border-gray-200', text: 'text-gray-700', icon: AlertCircle };
  };
  
  const suggestionStyle = getSuggestionStyle();
  const SuggestionIcon = suggestionStyle.icon;

  return (
    <div className="mt-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI分析报告</h3>
          <p className="text-sm text-gray-600">
            {new Date(analyzedAt).toLocaleString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* 分析部分 */}
      <div className="grid gap-4">
        {priceSection && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all">
            <h4 className="text-lg font-bold text-violet-700 mb-3">💰 目前价格</h4>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {priceSection.trim()}
            </div>
          </div>
        )}

        {trendSection && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all">
            <h4 className="text-lg font-bold text-purple-700 mb-3">📈 最近走势分析</h4>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {trendSection.trim()}
            </div>
          </div>
        )}

        {newsSection && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all">
            <h4 className="text-lg font-bold text-pink-700 mb-3">📰 最近相关新闻和财经研报分析</h4>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {newsSection.trim()}
            </div>
          </div>
        )}
      </div>

      {/* 操作建议卡片 */}
      {suggestion && (
        <div className={`bg-gradient-to-br ${suggestionStyle.bg} rounded-2xl p-6 border ${suggestionStyle.border}`}>
          <div>
            <h4 className={`text-lg font-bold mb-3 ${suggestionStyle.text}`}>📊 操作倾向</h4>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {suggestionSection}
            </div>
          </div>
        </div>
      )}

      {/* 数据说明 */}
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <p className="text-sm text-yellow-800 leading-relaxed">
          ⚠️ 本分析数据基于公开市场及财经信息来源，存在时效性与交易时段差异风险。操作倾向严格依据公开事实与逻辑推导，不构成任何投资推荐或买卖指令。投资有风险，请结合自身情况与专业顾问意见审慎决策。
        </p>
      </div>
    </div>
  );
}
