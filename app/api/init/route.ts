import { NextResponse } from 'next/server';
import { initializeApp } from '@/lib/init';

// 这个API路由用于触发应用初始化
export async function GET() {
  try {
    await initializeApp();
    return NextResponse.json({ message: '应用初始化成功' });
  } catch (error) {
    console.error('Init API Error:', error);
    return NextResponse.json(
      { error: '初始化失败' },
      { status: 500 }
    );
  }
}
