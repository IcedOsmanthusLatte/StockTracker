import { NextResponse } from 'next/server';
import { analyzeStock } from '@/lib/openai';
import { formatPrompt } from '@/lib/ai-prompt';
import { getStockBySymbol } from '@/lib/db-operations';
import { getTodayCache, saveTodayCache, analyzeWithRetry } from '@/lib/cache-utils';

export async function POST(request: Request) {
  try {
    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json(
        { error: '缺少股票代码' },
        { status: 400 }
      );
    }

    // 1. 检查是否有当天的缓存
    const cachedAnalysis = await getTodayCache(symbol);
    if (cachedAnalysis) {
      console.log(`[Analyze API] 使用 ${symbol} 的当天缓存`);
      return NextResponse.json({
        analysis: cachedAnalysis.analysis,
        analyzedAt: cachedAnalysis.analyzed_at,
        cached: true
      });
    }

    console.log(`[Analyze API] ${symbol} 没有当天缓存，开始AI分析`);

    // 2. 从数据库获取股票基本信息
    const stock = await getStockBySymbol(symbol);
    if (!stock) {
      return NextResponse.json(
        { error: '股票代码不存在于数据库中' },
        { status: 404 }
      );
    }

    // 3. 使用重试机制进行AI分析（最多3次）
    const analysis = await analyzeWithRetry(async () => {
      const prompt = formatPrompt({
        symbol: stock.symbol,
        name: stock.name
      });
      
      console.log(`[Analyze API] 调用AI分析 ${symbol}`);
      return await analyzeStock(prompt);
    }, 3);

    const analyzedAt = new Date().toISOString();

    // 4. 尝试保存到当天缓存（如果失败也不影响返回结果）
    try {
      await saveTodayCache(stock.id, symbol, analysis);
      console.log(`[Analyze API] ${symbol} 分析完成并已缓存`);
    } catch (cacheError) {
      console.warn(`[Analyze API] ${symbol} 缓存保存失败，但分析成功:`, cacheError);
    }

    // 5. 返回分析结果（无论缓存是否保存成功）
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
