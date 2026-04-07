import { NextResponse } from 'next/server';
import { getAllStocks } from '@/lib/db-operations';

export async function GET() {
  try {
    const allStocks = await getAllStocks();
    
    // 筛选出特别关注的股票
    const featuredStocks = allStocks.filter(stock => stock.list_type === 'featured');
    
    // 按 display_order 排序
    featuredStocks.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    
    return NextResponse.json({ 
      stocks: featuredStocks,
      count: featuredStocks.length 
    });
  } catch (error) {
    console.error('Error fetching featured stocks:', error);
    return NextResponse.json(
      { error: '获取特别关注列表失败' },
      { status: 500 }
    );
  }
}
