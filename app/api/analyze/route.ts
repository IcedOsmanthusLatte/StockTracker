import { NextResponse } from 'next/server';
import { getStockData } from '@/lib/stock-data';
import { analyzeStock } from '@/lib/openai';
import { formatPrompt } from '@/lib/ai-prompt';
import { getStockBySymbol, getLatestAnalysis, saveStockAnalysis } from '@/lib/db-operations';

export async function POST(request: Request) {
  try {
    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json(
        { error: '缺少股票代码' },
        { status: 400 }
      );
    }

    // 检查是否有24小时内的缓存分析
    const cachedAnalysis = await getLatestAnalysis(symbol);
    if (cachedAnalysis) {
      console.log('[Analyze API] 使用数据库缓存的分析结果');
      return NextResponse.json({
        analysis: cachedAnalysis.analysis,
        analyzedAt: cachedAnalysis.analyzed_at,
        cached: true
      });
    }

    const stockData = await getStockData(symbol);
    if (!stockData) {
      return NextResponse.json(
        { error: '股票代码不存在' },
        { status: 404 }
      );
    }

    const prompt = formatPrompt(stockData);
    const analysis = await analyzeStock(prompt);
    const analyzedAt = new Date().toISOString();

    // 保存分析结果到数据库
    const stock = await getStockBySymbol(symbol);
    if (stock) {
      await saveStockAnalysis(stock.id, symbol, analysis, analyzedAt);
      console.log('[Analyze API] 分析结果已保存到数据库');
    }

    return NextResponse.json({
      analysis,
      analyzedAt,
      cached: false
    });
  } catch (error) {
    console.error('Analysis API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '分析失败' },
      { status: 500 }
    );
  }
}
