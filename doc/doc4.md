# 认证检查 API 响应结构问题

## 问题描述
认证检查端点（`/api/auth/check`）返回的数据结构与 API 客户端期望的结构不匹配，导致前端获取到 `undefined` 值。

### 原始代码
```typescript
// app/api/auth/check/route.ts
return NextResponse.json({ success: false });
// 或
return NextResponse.json({ success: true, user });
```

```typescript
// components/ButtonCheckout.tsx
const { data: authData } = await apiClient.get("/auth/check");
// authData 为 undefined
```

## 问题原因
API 客户端的 axios 拦截器（在 `libs/api.ts` 中）会自动提取响应中的 `data` 属性：
```typescript
apiClient.interceptors.response.use(
  function (response) {
    return response.data;
  }
  // ... 错误处理
);
```

但是，认证检查端点没有将其响应包装在 `data` 对象中，导致了这个不匹配。

## 解决方案
将响应数据包装在 `data` 属性中，以匹配 API 客户端的预期：

```typescript
// app/api/auth/check/route.ts
return NextResponse.json({ data: { success: false } });
// 或
return NextResponse.json({ data: { success: true, user } });
```

## 主要经验
1. API 响应结构应该与客户端拦截器保持一致
2. 使用 axios 拦截器时，确保所有 API 端点都遵循预期的响应格式
3. 始终将响应数据包装在与 API 客户端配置匹配的结构中

## 注意事项
- 在开发 API 端点时，需要考虑前端拦截器的处理方式
- 保持响应数据结构的一致性对于前端数据处理至关重要
- 建议在项目中统一 API 响应格式，避免类似问题

## 图片生成功能实现

### 1. 用户计划与权限管理
1. 创建了 `/api/getPlan` 路由
   ```typescript
   // 获取用户计划信息
   const { data: profile } = await supabase
     .from("profiles")
     .select("plan")
     .eq("id", user.id)
     .single();
   ```
2. 实现了三级权限控制：
   - free：基础访问权限
   - basic：基础生成功能
   - advanced：高级生成功能

### 2. 生成界面优化
1. 基础/高级生成按钮
   - 基础按钮：所有用户可见
   - 高级按钮：仅高级用户可见，使用土豪金风格
   ```typescript
   {userPlan === 'advanced' && (
     <button className="btn bg-[#FFD700]">
       ✨ Advanced Generate
     </button>
   )}
   ```

2. 动态样式切换
   - 根据生成类型改变界面风格
   - 高级模式下使用金色主题
   - 添加渐变和过渡动画效果

### 3. 功能实现细节
1. 状态管理
   ```typescript
   const [userPlan, setUserPlan] = useState<'free'| 'basic' | 'advanced'>('free')
   const [generationType, setGenerationType] = useState<'basic' | 'advanced'>('basic')
   ```

2. 生成请求处理
   ```typescript
   const formData = new FormData()
   formData.append('prompt', prompt)
   formData.append('type', type)
   formData.append('reference_image', referenceImage)
   ```

3. 错误处理
   - 401 错误重定向到登录页
   - 生成失败提示
   - 文件类型验证

### 4. Stripe 订阅集成
1. Webhook 处理
   ```typescript
   await supabase
     .from("profiles")
     .update({
       customer_id: customerId,
       price_id: priceId,
       has_access: true,
       plan: priceId === config.stripe.plans[0].priceId ? "basic" : "advanced"
     })
   ```

2. 订阅状态更新
   - 支付成功时更新用户计划
   - 订阅取消时降级为免费计划
   - 自动处理订阅续费

### 5. 用户体验优化
1. 视觉反馈
   - 加载状态显示
   - 成功/失败提示
   - 按钮状态切换

2. 界面交互
   - 图片预览功能
   - 文件上传控制
   - 响应式布局

## 主要技术要点
1. Next.js API 路由实现
2. Supabase 认证和数据管理
3. Stripe 支付集成
4. React 状态管理
5. 条件渲染和样式切换
6. 文件处理和预览

## 待优化项目
1. 缓存优化
2. 错误重试机制
3. 批量生成功能
4. 历史记录功能
5. 更多高级选项

自动跳转只作用于服务器组件？客户端组件不行吗，一个猜测