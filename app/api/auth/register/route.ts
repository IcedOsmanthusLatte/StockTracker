import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
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

    // 注册用户（邮件验证已在Supabase控制台关闭）
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // 不需要邮件确认
      }
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // 创建用户profile
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email
      });
    }

    return NextResponse.json({
      message: '注册成功',
      user: data.user
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: '注册失败' },
      { status: 500 }
    );
  }
}
