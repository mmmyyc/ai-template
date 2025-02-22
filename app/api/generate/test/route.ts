import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@/libs/supabase/server";
import { Client } from "@upstash/qstash";

const qstash = new Client({
  baseUrl: process.env.QSTASH_URL!,
  token: process.env.QSTASH_TOKEN!,
})

export const dynamic = 'force-dynamic';

// 添加GET方法用于测试
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 }); 
  }

  try {
    // 创建测试任务ID
    const taskId = crypto.randomUUID();
    
    // 创建基本请求体
    const requestBody = {
      taskId,
      prompt: "Test prompt",
      type: "test"
    };

    // 将任务信息存储到数据库
    await supabase
      .from("image_generations")
      .insert({
        task_id: taskId,
        user_id: user.id,
        status: "pending",
        prompt: "Test prompt",
        type: "test"
      });

    // 设置10秒超时用于测试
    const timeout = 10000;
    
    // 发送测试请求
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/generate/test/mock`,
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Upstash-Callback': `${process.env.NEXT_PUBLIC_APP_URL}/api/generate/callback`,
        'Upstash-Failure-Callback': `${process.env.NEXT_PUBLIC_APP_URL}/api/generate/failure`,
        'Upstash-Retries': '1',
        'Upstash-Timeout': timeout.toString()
      },
      notBefore: 0,
      deadline: Math.floor(Date.now() / 1000) + (timeout / 1000)
    });

    return NextResponse.json({
      data: {
        status: "pending",
        taskId,
        testType: "timeout"
      }
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test error occurred' },
      { status: 500 }
    );
  }
}

// 保留原有的POST方法
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 }); 
  }

  try {
    const formData = await request.formData();
    const testType = formData.get('testType') as string;
    
    // 创建测试任务ID
    const taskId = crypto.randomUUID();
    
    // 创建基本请求体
    const requestBody = {
      taskId,
      prompt: "Test prompt",
      type: "test"
    };

    // 将任务信息存储到数据库
    await supabase
      .from("image_generations")
      .insert({
        task_id: taskId,
        user_id: user.id,
        status: "pending",
        prompt: "Test prompt",
        type: "test"
      });

    // 根据测试类型设置不同的超时时间
    const timeout = testType === 'timeout' ? 10000 : 300000; // 超时测试使用10秒
    
    // 发送测试请求
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/generate/test/mock`,
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Upstash-Callback': `${process.env.NEXT_PUBLIC_APP_URL}/api/generate/callback`,
        'Upstash-Failure-Callback': `${process.env.NEXT_PUBLIC_APP_URL}/api/generate/failure`,
        'Upstash-Retries': '1',
        'Upstash-Timeout': timeout.toString()
      },
      notBefore: 0,
      deadline: Math.floor(Date.now() / 1000) + (timeout / 1000)
    });

    return NextResponse.json({
      data: {
        status: "pending",
        taskId,
        testType
      }
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test error occurred' },
      { status: 500 }
    );
  }
} 