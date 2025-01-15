import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// 这个 API 路由会：
// 验证用户是否已登录
// 从数据库获取用户的 profile 信息
// 如果用户有 Stripe customer_id，则获取详细的订阅信息
// 返回用户的订阅状态、计划和其他相关信息

// 在任何需要检查订阅状态的组件中
// const checkSubscription = async () => {
//     try {
//       const response = await apiClient.get('/subscription')
//       const { subscription } = response.data
      
//       if (subscription.status === 'active') {
//         // 用户有活跃的订阅
//         console.log('Current plan:', subscription.plan)
//         console.log('Subscription details:', subscription.subscriptionDetails)
//       } else {
//         // 用户没有活跃的订阅
//         console.log('No active subscription')
//       }
//     } catch (error) {
//       console.error('Failed to check subscription:', error)
//     }
// }

// 初始化 Stripe 实例
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});

// Add dynamic route config
export const dynamic = 'force-dynamic';

/**
 * 获取当前用户的订阅信息
 * GET /api/subscription
 */
export async function GET() {
  try {
    // 创建 Supabase 客户端
    const supabase = createClient();
    
    // 获取当前用户信息
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" }, 
        { status: 401 }
      );
    }

    // 获取用户的 profile，包含订阅信息
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // 如果用户有 customer_id，获取 Stripe 订阅信息
    if (profile.customer_id) {
      try {
        // 获取用户的所有订阅
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.customer_id,
          status: 'active',  // 只获取活跃的订阅
          expand: ['data.plan.product']  // 包含计划和产品详情
        });

        // 返回用户订阅信息
        return NextResponse.json({
          subscription: {
            status: profile.has_access ? 'active' : 'inactive',
            plan: profile.price_id,
            subscriptionDetails: subscriptions.data[0] || null,
            customer: profile.customer_id,
          }
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        // 即使 Stripe 查询失败，仍返回基本信息
        return NextResponse.json({
          subscription: {
            status: profile.has_access ? 'active' : 'inactive',
            plan: profile.price_id,
            customer: profile.customer_id,
          }
        });
      }
    }

    // 用户没有订阅信息
    return NextResponse.json({
      subscription: {
        status: 'none',
        plan: null,
        customer: null,
      }
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}