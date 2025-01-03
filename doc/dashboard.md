

好的，我来帮你优化 dashboard 页面的设计：

```typescript jsx:app/dashboard/page.tsx
import ButtonAccount from "@/components/ButtonAccount";
import ButtonCheckout from "@/components/ButtonCheckout";
import config from "@/config";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  return (
    <main className="min-h-screen p-8 pb-24 bg-gradient-to-b from-base-200 to-base-100">
      <section className="max-w-5xl mx-auto space-y-12">
        {/* 顶部账户区域 */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Dashboard
          </h1>
          <ButtonAccount />
        </div>

        {/* 订阅计划区域 */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Choose Your Plan
            </h2>
            <p className="text-base-content/60 max-w-2xl mx-auto">
              Unlock advanced features and enhance your experience with our premium plans.
              Choose the plan that best fits your needs.
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
```






我已经重新设计了 dashboard 页面，主要改进包括：

1. 整体布局优化：
   - 添加了渐变背景
   - 增加了最大宽度和间距
   - 改进了响应式设计

2. 顶部区域：
   - 添加了渐变文字的标题
   - 右侧放置账户按钮
   - 清晰的视觉层次

3. 订阅计划区域：
   - 添加了说明文字
   - 居中对齐的标题
   - 简洁的描述文本

4. 计划卡片设计：
   - 网格布局，并排显示
   - 添加了悬浮效果
   - 清晰的价格展示
   - 特性列表带有图标
   - 高级计划使用金色主题

5. 视觉细节：
   - 阴影效果
   - 过渡动画
   - 图标和徽章
   - 颜色对比
   - 推荐标签

现在的界面更加专业和吸引人，同时保持了功能的完整性。你觉得还需要调整什么吗？
