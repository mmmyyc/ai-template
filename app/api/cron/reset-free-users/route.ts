import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 验证 Cron Secret
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient();

    // 执行重置操作
    const { error } = await supabase
      .from('profiles')
      .update({ 
        available_uses: 3,
        updated_at: new Date().toISOString()
      })
      .eq('plan', 'free');

    if (error) throw error;

    // // 记录日志
    // await supabase
    //   .from('cron_logs')
    //   .insert({
    //     operation: 'reset_free_users_usage',
    //     details: 'Reset available_uses to 3 for free users',
    //     status: 'success'
    //   });

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully reset free users usage' 
    });

  } catch (error) {
    console.error('Failed to reset free users usage:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset free users usage' 
      },
      { status: 500 }
    );
  }
}