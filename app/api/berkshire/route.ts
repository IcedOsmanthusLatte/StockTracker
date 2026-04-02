import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }

    // 获取伯克希尔前十大持仓
    const { data: stocks, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('list_type', 'berkshire')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching Berkshire holdings:', error);
      return NextResponse.json(
        { error: '获取伯克希尔持仓失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stocks: stocks || [] });
  } catch (error) {
    console.error('Berkshire API Error:', error);
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    );
  }
}
