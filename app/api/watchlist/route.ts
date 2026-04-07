import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - 获取用户的关注列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取用户关注列表，JOIN stocks表获取股票信息
    const { data, error } = await supabase
      .from('user_watchlist')
      .select(`
        id,
        stock_id,
        created_at,
        stocks (
          id,
          symbol,
          name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: '获取关注列表失败' },
        { status: 500 }
      );
    }

    // 转换数据格式
    const watchlist = data.map((item: any) => ({
      id: item.id,
      stock_id: item.stock_id,
      symbol: item.stocks.symbol,
      name: item.stocks.name,
      added_at: item.added_at,
    }));

    return NextResponse.json({ watchlist });
  } catch (error) {
    console.error('Get watchlist error:', error);
    return NextResponse.json(
      { error: '获取关注列表失败' },
      { status: 500 }
    );
  }
}

// POST - 添加股票到关注列表
export async function POST(request: Request) {
  try {
    const { userId, symbol, name } = await request.json();

    if (!userId || !symbol || !name) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 首先验证用户是否存在
    console.log('[Watchlist] Checking user:', userId, 'Type:', typeof userId);
    
    const { data: userExists, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    console.log('[Watchlist] User check result:', { userExists, userCheckError });

    if (userCheckError || !userExists) {
      console.error('[Watchlist] User not found in database:', userId, userCheckError);
      return NextResponse.json(
        { error: '用户不存在，请重新登录' },
        { status: 401 }
      );
    }

    console.log('[Watchlist] User verified:', userId);

    // 查找或创建股票
    let stockId: number;
    
    // 先查找股票是否存在
    const { data: existingStock } = await supabase
      .from('stocks')
      .select('id')
      .eq('symbol', symbol)
      .single();

    if (existingStock) {
      stockId = existingStock.id;
    } else {
      // 股票不存在，创建新股票
      const { data: newStock, error: createError } = await supabase
        .from('stocks')
        .insert({
          symbol,
          name,
          list_type: 'user', // 用户自定义股票
        })
        .select('id')
        .single();

      if (createError || !newStock) {
        console.error('Failed to create stock:', createError);
        return NextResponse.json(
          { error: '创建股票失败' },
          { status: 500 }
        );
      }

      stockId = newStock.id;
    }

    // 检查用户是否已关注该股票
    const { data: existing } = await supabase
      .from('user_watchlist')
      .select('id')
      .eq('user_id', userId)
      .eq('stock_id', stockId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: '该股票已在关注列表中' },
        { status: 400 }
      );
    }

    // 检查关注列表数量
    const { count } = await supabase
      .from('user_watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (count !== null && count >= 5) {
      return NextResponse.json(
        { error: '关注列表已满（最多5只股票）' },
        { status: 400 }
      );
    }

    // 添加到关注列表
    const { data: newItem, error } = await supabase
      .from('user_watchlist')
      .insert({
        user_id: userId,
        stock_id: stockId,
      })
      .select(`
        id,
        created_at,
        stocks (
          id,
          symbol,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: '添加失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '添加成功',
      item: newItem as any
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    return NextResponse.json(
      { error: '添加失败' },
      { status: 500 }
    );
  }
}

// DELETE - 从关注列表删除股票
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 删除（确保是该用户的关注项）
    const { error } = await supabase
      .from('user_watchlist')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete from watchlist error:', error);
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    );
  }
}
