import { NextResponse } from 'next/server';
import { getAllStocks } from '@/lib/db-operations';

export async function GET() {
  try {
    const stocks = await getAllStocks();
    return NextResponse.json({ stocks });
  } catch (error) {
    console.error('Public List API Error:', error);
    return NextResponse.json(
      { error: '获取公开列表失败' },
      { status: 500 }
    );
  }
}
