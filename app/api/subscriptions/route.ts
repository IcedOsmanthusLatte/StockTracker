import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getUserSubscriptions, addUserSubscription, removeUserSubscription, setUserSubscriptions } from '@/lib/storage';

export async function GET() {
  try {
    const userId = await getUserId();
    const subscriptions = getUserSubscriptions(userId);
    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Get Subscriptions Error:', error);
    return NextResponse.json(
      { error: '获取订阅列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const { symbol } = await request.json();

    if (!symbol) {
      return NextResponse.json(
        { error: '请提供股票代码' },
        { status: 400 }
      );
    }

    addUserSubscription(userId, symbol.toUpperCase());
    const subscriptions = getUserSubscriptions(userId);

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Add Subscription Error:', error);
    return NextResponse.json(
      { error: '添加订阅失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: '请提供股票代码' },
        { status: 400 }
      );
    }

    removeUserSubscription(userId, symbol.toUpperCase());
    const subscriptions = getUserSubscriptions(userId);

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Remove Subscription Error:', error);
    return NextResponse.json(
      { error: '删除订阅失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const { symbols } = await request.json();

    if (!Array.isArray(symbols)) {
      return NextResponse.json(
        { error: '无效的订阅列表' },
        { status: 400 }
      );
    }

    setUserSubscriptions(userId, symbols.map(s => s.toUpperCase()));
    const subscriptions = getUserSubscriptions(userId);

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Update Subscriptions Error:', error);
    return NextResponse.json(
      { error: '更新订阅列表失败' },
      { status: 500 }
    );
  }
}
