import { NextResponse } from 'next/server';
import { getStockData, searchStocks } from '@/lib/stock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const query = searchParams.get('query');

  try {
    if (query) {
      const results = searchStocks(query);
      return NextResponse.json({ stocks: results });
    }

    if (symbol) {
      const data = await getStockData(symbol);
      if (!data) {
        return NextResponse.json(
          { error: '股票代码不存在' },
          { status: 404 }
        );
      }
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: '请提供股票代码或搜索关键词' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Stock API Error:', error);
    return NextResponse.json(
      { error: '获取股票数据失败' },
      { status: 500 }
    );
  }
}
