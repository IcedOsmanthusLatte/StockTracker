export const STOCK_ANALYSIS_PROMPT = `你是一位专业的股票分析师，请严格按照以下格式和要求进行分析。

股票信息：
股票名称：{name}
股票代码：{symbol}
当前价格：{price}
涨跌幅：{change}%
成交量：{volume}
市盈率：{pe}
52周最高：{high52w}
52周最低：{low52w}

请严格按照以下结构输出分析（不要添加额外的标题或说明）：

【{name}/{symbol}】

===SECTION_1_START===
给出最新价格（注明日期或交易时段），并说明较前一交易日的变动（如上涨/下跌百分比或小幅波动）。
注意：不要重复写"目前价格"这个标题，直接写内容。
===SECTION_1_END===

===SECTION_2_START===
客观描述短期（一周以内）、中期（一月左右）和较长期（一年内）的价格表现，提及52周范围及当前所处位置（如高位、中位、低位）。
注意：不要重复写"最近走势分析"这个标题，直接写内容。
===SECTION_2_END===

===SECTION_3_START===
列出公开可查的最近重要新闻、公告及机构研报要点，并对每条新闻或研报进行简要分析，说明其对股价的潜在影响（利好/利空/中性）及影响程度。分析需基于事实，不添加主观推测。如果没有可靠的新闻来源，请明确说明"暂无可靠的公开新闻或研报信息"。
注意：不要重复写"最近相关新闻和财经研报分析"这个标题，直接写内容。
===SECTION_3_END===

===SECTION_4_START===
从以下选项中选择一项：
- 强烈建议补仓
- 轻微建议补仓
- 不增不减
- 轻微建议卖出
- 强烈建议卖出
- 我不知道（仅当依据不足以形成相对可靠观点时使用）

必须同时给出明确依据和逻辑，依据需基于公开事实、公告、研报数据或价格表现，不得包含主观臆测或缺乏事实支撑的推断。
注意：不要重复写"操作建议和依据"这个标题，直接写内容。
===SECTION_4_END===

【重要格式要求】
1. 严格使用 ===SECTION_X_START=== 和 ===SECTION_X_END=== 标记每个部分
2. 每个部分的内容不要包含该部分的标题，直接写内容即可
3. 不要在回答中包含任何引用链接，如 [[1]](url) 这样的格式
4. 直接陈述事实和分析，不需要标注信息来源的链接
5. 每个部分的内容必须完整，不要截断

整体要求：
- 语气实事求是、认真谨慎
- 仅针对问题直接回答，不进行额外联想或延展
- 所有判断必须有明确的事实依据
- 不要添加引用链接或脚注`;

export function formatPrompt(stockData: {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  pe?: number;
  high52w?: number;
  low52w?: number;
}): string {
  return STOCK_ANALYSIS_PROMPT
    .replace('{symbol}', stockData.symbol)
    .replace('{name}', stockData.name)
    .replace('{price}', stockData.price.toFixed(2))
    .replace('{change}', stockData.change.toFixed(2))
    .replace('{volume}', stockData.volume.toLocaleString())
    .replace('{pe}', stockData.pe?.toFixed(2) || 'N/A')
    .replace('{high52w}', stockData.high52w?.toFixed(2) || 'N/A')
    .replace('{low52w}', stockData.low52w?.toFixed(2) || 'N/A');
}
