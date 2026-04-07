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

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 检查邮箱是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户（username字段存储邮箱）
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username: email,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: '注册失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '注册成功',
      user: {
        id: newUser.id,
        email: newUser.username,
        created_at: newUser.created_at,
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: '注册失败' },
      { status: 500 }
    );
  }
}
