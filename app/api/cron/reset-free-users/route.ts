import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 验证 Cron Secret
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    // 使用 service_role 创建客户端
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // 使用 service_role key
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

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