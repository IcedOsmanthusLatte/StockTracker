import { NextResponse } from 'next/server';
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

    // 缓存已禁用 - 每次都调用API进行新分析
    // const cachedAnalysis = await getLatestAnalysis(symbol);
    // if (cachedAnalysis) {
    //   console.log('[Analyze API] 使用数据库缓存的分析结果');
    //   return NextResponse.json({
    //     analysis: cachedAnalysis.analysis,
    //     analyzedAt: cachedAnalysis.analyzed_at,
    //     cached: true
    //   });
    // }
    console.log('[Analyze API] 缓存已禁用，每次都调用API进行新分析');

    // 从数据库获取股票基本信息
    const stock = await getStockBySymbol(symbol);
    if (!stock) {
      return NextResponse.json(
        { error: '股票代码不存在于数据库中' },
        { status: 404 }
      );
    }

    // 只传递股票代码和名称，让AI通过web_search获取所有实时数据
    const prompt = formatPrompt({
      symbol: stock.symbol,
      name: stock.name
    });
    
    console.log('[Analyze API] 开始AI分析，AI将通过web_search获取实时数据');
    const analysis = await analyzeStock(prompt);
    const analyzedAt = new Date().toISOString();

    // 保存分析结果到数据库
    await saveStockAnalysis(stock.id, symbol, analysis, analyzedAt);
    console.log('[Analyze API] 分析结果已保存到数据库');

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
