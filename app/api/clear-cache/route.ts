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
    // 删除所有股票分析缓存
    const { error } = await supabase
      .from('stock_analyses')
      .delete()
      .neq('id', 0); // 删除所有记录的技巧

    if (error) {
      console.error('清除缓存失败:', error);
      return NextResponse.json(
        { error: '清除缓存失败: ' + error.message },
        { status: 500 }
      );
    }

    console.log('[Clear Cache] 所有分析缓存已清除');
    return NextResponse.json({ 
      message: '分析缓存已清除，可以重新进行AI分析',
      success: true 
    });
  } catch (error) {
    console.error('Clear Cache Error:', error);
    return NextResponse.json(
      { error: '清除缓存失败' },
      { status: 500 }
    );
  }
}
