import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // 直接查询 list_type 为 'featured' 的股票
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('list_type', 'featured')
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching featured stocks:', error);
      return NextResponse.json(
        { error: '获取特别关注列表失败' },
        { status: 500 }
      );
    }
    
    console.log('Featured stocks fetched:', data?.length || 0);
    
    return NextResponse.json({ 
      stocks: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error fetching featured stocks:', error);
    return NextResponse.json(
      { error: '获取特别关注列表失败' },
      { status: 500 }
    );
  }
}
