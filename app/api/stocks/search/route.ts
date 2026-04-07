import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - 搜索股票
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: '请输入搜索关键词' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 搜索股票（按symbol或name模糊匹配）
    const { data, error } = await supabase
      .from('stocks')
      .select('id, symbol, name')
      .or(`symbol.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: '搜索失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stocks: data || [] });
  } catch (error) {
    console.error('Stock search error:', error);
    return NextResponse.json(
      { error: '搜索失败' },
      { status: 500 }
    );
  }
}
