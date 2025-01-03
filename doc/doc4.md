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


自动跳转只作用于服务器组件？客户端组件不行吗，一个猜测