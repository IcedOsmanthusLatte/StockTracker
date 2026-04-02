import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase client not initialized' },
      { status: 500 }
    );
  }

  try {
    // 插入初始股票数据
    const stocks = [
      { symbol: '600519', name: '贵州茅台' },
      { symbol: '000858', name: '五粮液' },
      { symbol: '601318', name: '中国平安' },
      { symbol: '600036', name: '招商银行' },
      { symbol: '000333', name: '美的集团' }
    ];

    const results = [];
    for (const stock of stocks) {
      const { data, error } = await supabase
        .from('stocks')
        .upsert(stock, { onConflict: 'symbol' })
        .select();
      
      if (error) {
        console.error(`插入 ${stock.name} 失败:`, error);
        results.push({ stock: stock.name, success: false, error: error.message });
      } else {
        console.log(`✓ ${stock.name} 已添加`);
        results.push({ stock: stock.name, success: true, data });
      }
    }

    return NextResponse.json({ 
      message: '数据库初始化完成',
      results 
    });
  } catch (error) {
    console.error('Init DB Error:', error);
    return NextResponse.json(
      { error: '初始化数据库失败' },
      { status: 500 }
    );
  }
}
