import ButtonAccount from "@/components/ButtonAccount";
import ButtonCheckout from "@/components/ButtonCheckout";
import config from "@/config";
import { createClient } from "@/libs/supabase/server";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  // 获取用户计划名称和样式
  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case 'advanced':
        return {
          name: '尊贵的高级会员',
          className: 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black'
        };
      case 'basic':
        return {
          name: '尊贵的基础会员',
          className: 'bg-gradient-to-r from-primary to-secondary text-primary-content'
        };
      default:
        return {
          name: '免费用户',
          className: 'bg-base-300'
        };
    }
  };

  const planInfo = getPlanInfo(profile?.plan || 'free');

  return (
    <main className="min-h-screen p-8 pb-24 bg-gradient-to-b from-base-200 to-base-100">
      <section className="max-w-5xl mx-auto space-y-12">
        {/* 顶部账户区域 */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              <Link href="/">
                Dashboard
              </Link>
            </h1>
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${planInfo.className} font-bold shadow-lg`}>
              <span className="mr-2">
                {profile?.plan === 'advanced' && '✨ '}
                {planInfo.name}
              </span>
              {profile?.plan === 'advanced' && (
                <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse"></div>
              )}
            </div>
          </div>
          <ButtonAccount />
        </div>
        {/* 订阅计划区域 */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              {profile?.plan === 'free' ? '选择您的会员计划' : '升级您的会员计划'}
            </h2>
            <p className="text-base-content/60 max-w-2xl mx-auto">
              解锁更多高级功能，提升您的使用体验。
              选择最适合您需求的计划。
            </p>
          </div>

          {/* 计划卡片 */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* 基础计划 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <h3 className="card-title text-2xl font-bold">Basic Plan</h3>
                <div className="py-4">
                  <p className="text-4xl font-bold">
                    ${config.stripe.plans[0].price}
                    <span className="text-lg text-base-content/60">/month</span>
                  </p>
                  <div className="mt-6 space-y-4">
                    {config.stripe.plans[0].features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ButtonCheckout
                  mode="subscription"
                  priceId={config.stripe.plans[0].priceId}
                />
              </div>
            </div>

            {/* 高级计划 */}
            <div className="card bg-gradient-to-br from-[#FFD700]/10 to-[#FFA500]/10 shadow-xl hover:shadow-2xl transition-shadow border-2 border-[#FFD700]">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h3 className="card-title text-2xl font-bold">Advanced Plan</h3>
                  <span className="badge badge-primary">RECOMMENDED</span>
                </div>
                <div className="py-4">
                  <p className="text-4xl font-bold">
                    ${config.stripe.plans[1].price}
                    <span className="text-lg text-base-content/60">/month</span>
                  </p>
                  <div className="mt-6 space-y-4">
                    {config.stripe.plans[1].features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#FFD700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ButtonCheckout
                  mode="subscription"
                  priceId={config.stripe.plans[1].priceId}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
