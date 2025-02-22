import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 15000)); // 15秒延迟
    
    // 由于设置的超时时间是10秒，这个响应永远不会被发送
    return NextResponse.json({
      success: true,
      taskId: data.taskId,
      result: "Test result"
    });

  } catch (error) {
    console.error('Mock endpoint error:', error);
    return NextResponse.json(
      { error: 'Mock endpoint error' },
      { status: 500 }
    );
  }
} 