import configFile from "@/config";
import { findCheckoutSession } from "@/libs/stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import config from "@/config";

// 初始化 Stripe 实例，配置 API 版本和类型支持
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});

// Webhook 密钥，用于验证请求来源
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// This is where we receive Stripe webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
// 这里用于接收 Stripe webhook 事件
// 用于更新用户数据、发送邮件等操作
// 默认情况下，它会将用户信息存储在数据库中
// 更多信息请参考：https://shipfa.st/docs/features/payments
export async function POST(req: NextRequest) {
  // 获取原始请求体数据
  const body = await req.text();

  // 获取 Stripe 签名用于验证
  const signature = headers().get("stripe-signature");

  let eventType;
  let event;

  // Create a private supabase client using the secret service_role API key
  // 使用服务端密钥创建具有管理权限的 Supabase 客户端
  const supabase = new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // verify Stripe event is legit
  // 验证 Stripe 事件的合法性
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // 获取事件类型
  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        // 用户刚结完账。
        // First payment is successful and a subscription is created (if mode was set to "subscription" in ButtonCheckout)
        // ✅ Grant access to the product
        // 首次支付成功，并创建订阅（如果在 ButtonCheckout 中设置了订阅模式）
        // ✅ 授予产品访问权限
        const stripeObject: Stripe.Checkout.Session = event.data
          .object as Stripe.Checkout.Session;

        const session = await findCheckoutSession(stripeObject.id);

        // 提取会话中的关键信息
        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const userId = stripeObject.client_reference_id;
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        // 获取 Stripe 客户信息
        const customer = (await stripe.customers.retrieve(
          customerId as string
        )) as Stripe.Customer;

        if (!plan) break;

        let user;
        if (!userId) {
          // check if user already exists
          // 检查用户是否已存在
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", customer.email)
            .single();
          if (profile) {
            user = profile;
          } else {
            // create a new user using supabase auth admin
            // 使用 Supabase 管理员权限创建新用户
            const { data } = await supabase.auth.admin.createUser({
              email: customer.email,
            });

            user = data?.user;
          }
        } else {
          // find user by ID
          // 通过 ID 查找用户
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          user = profile;
        }
        // 更新用户配置信息
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            customer_id: customerId,
            price_id: priceId,
            has_access: true,
            plan: priceId === config.stripe.plans[1].priceId ? "basic" : "advanced",
            available_uses : (priceId === config.stripe.plans[1].priceId ? 50 : 200),
          })
          .eq("id", user?.id);
        // Extra: send email with user link, product page, etc...
        // 扩展功能：发送包含用户链接、产品页面等的邮件
        // try {
        //   await sendEmail(...);
        // } catch (e) {
        //   console.error("Email issue:" + e?.message);
        // }
        // 错误排查
        // if (updateError) {
        //   console.error("Webhook - Profile update error:", updateError);
        // } else {
        //   console.log("Webhook - Successfully updated profile for user:", user?.id);
        // }
        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        // You don't need to do anything here, by you can send an email to the user to remind him to complete the transaction, for instance
        // 用户未完成交易
        // 这里不需要做任何事情，但你可以发送邮件提醒用户完成交易
        break;
      }

      case "customer.subscription.updated": {
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        const stripeObject: Stripe.Subscription = event.data.object as Stripe.Subscription;
        const subscription = await stripe.subscriptions.retrieve(stripeObject.id);
        const newPriceId = subscription.items.data[0].price.id;
        const customerId = subscription.customer;

        // 获取用户当前的配置信息
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("price_id")
          .eq("customer_id", customerId)
          .single();

        // 只有当价格ID发生变化时才更新用户计划
        if (currentProfile && currentProfile.price_id !== newPriceId) {
          await supabase
            .from("profiles")
            .update({ 
              price_id: newPriceId,
              has_access: true,
              plan: newPriceId === config.stripe.plans[1].priceId ? "basic" : "advanced",
              available_uses: newPriceId === config.stripe.plans[1].priceId ? 50 : 200
            })
            .eq("customer_id", customerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        // The customer subscription stopped
        // ❌ Revoke access to the product
        // 客户订阅已停止
        // ❌ 撤销产品访问权限
        const stripeObject: Stripe.Subscription = event.data
          .object as Stripe.Subscription;
        const subscription = await stripe.subscriptions.retrieve(
          stripeObject.id
        );

        await supabase
          .from("profiles")
          .update({ 
            has_access: false, 
            plan: "free",
            available_uses: 3,
            price_id: null
          })
          .eq("customer_id", subscription.customer);
        break;
      }

      case "invoice.paid": {
        // Customer just paid an invoice (for instance, a recurring payment for a subscription)
        // ✅ Grant access to the product
        // 客户刚刚支付了发票（例如，订阅的定期付款）
        // ✅ 授予产品访问权限
        const stripeObject: Stripe.Invoice = event.data
          .object as Stripe.Invoice;
        const priceId = stripeObject.lines.data[0].price.id;
        const customerId = stripeObject.customer;

        // Find profile where customer_id equals the customerId (in table called 'profiles')
        // 在 'profiles' 表中查找 customer_id 等于 customerId 的用户档案
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("customer_id", customerId)
          .single();

        // Make sure the invoice is for the same plan (priceId) the user subscribed to
        // 确保发票对应的是用户订阅的相同计划（priceId）
        if (profile.price_id !== priceId) break;

        // Grant the profile access to your product. It's a boolean in the database, but could be a number of credits, etc...
        // 授予用户档案产品访问权限。在数据库中是一个布尔值，但也可以是信用点数等
        await supabase
          .from("profiles")
          .update({ has_access: true , plan: priceId === config.stripe.plans[1].priceId ? "basic" : "advanced" ,
             available_uses: priceId === config.stripe.plans[1].priceId ? 50 : 200
            })
          .eq("customer_id", customerId);

        break;
      }

      case "invoice.payment_failed":
        // A payment failed (for instance the customer does not have a valid payment method)
        // ❌ Revoke access to the product
        // ⏳ OR wait for the customer to pay (more friendly):
        //      - Stripe will automatically email the customer (Smart Retries)
        //      - We will receive a "customer.subscription.deleted" when all retries were made and the subscription has expired
        // 支付失败（例如客户没有有效的支付方式）
        // ❌ 撤销产品访问权限
        // ⏳ 或者等待客户支付（更友好的方式）：
        //      - Stripe 会自动发送邮件给客户（智能重试）
        //      - 当所有重试都完成且订阅过期时，我们会收到 "customer.subscription.deleted" 事件

        break;

      default:
      // Unhandled event type
      // 未处理的事件类型
    }
  } catch (e) {
    console.error("stripe error: ", e.message);
    // 即使发生错误，也返回 200 状态码
    // 这是因为 Stripe 需要收到 2xx 响应来确认 webhook 已被接收
    // 我们在这里记录错误，但仍然返回成功响应
    return NextResponse.json(
      { 
        error: e.message,
        received: true 
      }, 
      { status: 200 }
    );
  }

  // 返回成功响应
  return NextResponse.json(
    { received: true },
    { status: 200 }
  );
}
