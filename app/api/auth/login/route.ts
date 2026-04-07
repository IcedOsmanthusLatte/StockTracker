import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 查找用户（username字段存储的是邮箱）
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', email)
      .single();

    console.log('[Login] User query result:', { user, error });

    if (error || !user) {
      console.error('[Login] User not found:', email, error);
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    console.log('[Login] User found with ID:', user.id, 'Type:', typeof user.id);

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: '登录成功',
      user: {
        id: user.id,
        email: user.username,
        created_at: user.created_at,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
