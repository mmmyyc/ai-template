import config from "@/config";
import ButtonCheckout from "./ButtonCheckout";
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';

// 定义特性的接口
interface Feature {
  name: string;
}

// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

const Pricing = () => {
  const t = useTranslations('Pricing');
  const locale = useLocale();
  const isChinese = locale === 'zh';
  
  // Get translated plan details
  const getTranslatedPlans = () => {
    return config.stripe.plans.map((plan) => {
      const planKey = plan.name.toLowerCase();
      let description;
      try {
        description = t(`plans.${planKey}.description`);
      } catch (e) {
        description = plan.description; 
      }
      
      // 使用t.raw()直接从翻译文件中获取特性数组，避免循环和异常处理
      let translatedFeatures: Feature[] = [];
      try {
        // 尝试获取特性数组
        const featuresArray = t.raw(`plans.${planKey}.features`);
        if (featuresArray && typeof featuresArray === 'object') {
          // 将对象转换为数组
          translatedFeatures = Object.values(featuresArray).map(feature => ({ name: String(feature) }));
        }
      } catch (e) {
        // 如果无法从翻译中获取，则使用配置中的特性
        translatedFeatures = plan.features || [];
      }
      
      return {
        ...plan,
        name: t(`plans.${planKey}.name`),
        description: description,
        translatedFeatures: translatedFeatures
      };
    });
  };
  
  const translatedPlans = getTranslatedPlans();
  
  return (
    <section className="bg-base-200 overflow-hidden" id="pricing">
      <div className="py-24 px-8 max-w-5xl mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          {/* <p className="font-medium text-primary mb-8">Pricing</p> */}
          <h2 className="font-bold text-3xl lg:text-5xl tracking-tight">
            {t('title')}
          </h2>
        </div>

        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
          {translatedPlans.map((plan, index) => (
            <div key={plan.priceId} className="relative w-full max-w-lg">
              {plan.isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span
                    className={`badge text-xs text-primary-content font-semibold border-0 bg-primary`}
                  >
                    {t('popularBadge')}
                  </span>
                </div>
              )}

              {plan.isFeatured && (
                <div
                  className={`absolute -inset-[1px] rounded-[9px] bg-primary z-10`}
                ></div>
              )}

              <div className="relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-base-100 p-8 rounded-lg">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="text-lg lg:text-xl font-bold">{plan.name}</p>
                    {plan.description && (
                      <p className="text-base-content/80 mt-2">
                        {plan.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {plan.priceAnchor && (
                    <div className="flex flex-col justify-end mb-[4px] text-lg ">
                      <p className="relative">
                        <span className="absolute bg-base-content h-[1.5px] inset-x-0 top-[53%]"></span>
                        <span className="text-base-content/80">
                          ${plan.priceAnchor}
                        </span>
                      </p>
                    </div>
                  )}
                  <p className={`text-5xl tracking-tight font-extrabold`}>
                    ${plan.price}
                  </p>
                  <div className="flex flex-col justify-end mb-[4px]">
                    <p className="text-xs text-base-content/60 uppercase font-semibold">
                      {t('currency')}
                    </p>
                  </div>
                </div>
                {plan.translatedFeatures && (
                  <ul className="space-y-2.5 leading-relaxed text-base flex-1">
                    {plan.translatedFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-[18px] h-[18px] opacity-80 shrink-0"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>

                        <span>{feature.name} </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="space-y-2">
                  {plan.name !== t(`plans.free.name`) && (
                    <>
                      {isChinese && plan.cnPriceId ? (
                        <ButtonCheckout priceId={plan.cnPriceId} mode="payment" />
                      ) : (
                        <ButtonCheckout priceId={plan.priceId} mode="payment" />
                      )}
                      <p className="flex items-center justify-center gap-2 text-sm text-center text-base-content/80 font-medium relative">
                        {t('paidPlanSubtext')}
                      </p>
                    </>
                  )}
                  {plan.name === t(`plans.free.name`) && (
                    <>
                      <Link 
                        href="/dashboard" 
                        className="btn btn-primary btn-block group"
                      >
                        {t('freePlanButton')}
                      </Link>
                      <p className="flex items-center justify-center gap-2 text-sm text-center text-base-content/80 font-medium relative">
                        {t('freePlanSubtext')}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
