# HTTPS 长轮询实现指南

## 概述
长轮询是一种客户端向服务器发出 HTTP 请求，服务器保持响应直到有新数据可用或超时的技术。这种方法提供了接近实时的更新，同时比 WebSocket 或 SSE 更简单易实现。

## 实现方案

### 1. 后端 API 结构

#### 状态检查端点 (`/api/generate/status`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@/libs/supabase/server";

export const dynamic = 'force-dynamic';

/**
 * 获取任务状态的 GET 请求
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  try {
    // 获取任务状态
    const { data: task, error } = await supabase
      .from("image_generations")
      .select("*")
      .eq("task_id", taskId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to fetch task status" }, { status: 500 });
    }

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        status: task.status,
        result: task.result,
        error: task.error
      }
    });

  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 2. 前端实现

#### 使用生成状态控制轮询
我们可以利用组件中已有的 `isGenerating` 状态来控制轮询过程，避免引入额外的状态变量：

```typescript
// 组件状态
const [isGenerating, setIsGenerating] = useState(false);
const [result, setResult] = useState<string | null>(null);

// 处理图片生成
const handleGenerate = async (type: 'basic' | 'advanced' = 'basic') => {
  if (!prompt) {
    toast.error('Please enter a prompt')
    return
  }

  setIsGenerating(true)
  
  try {
    // 清除之前的结果
    if (result) {
      URL.revokeObjectURL(result)
      setResult(null)
    }

    const formData = new FormData()
    formData.append('prompt', prompt)
    if (referenceImage) {
      formData.append('reference_image', referenceImage)
    }
    
    const endpoint = type === 'advanced' ? '/generate_advanced' : '/generate'
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data?.taskId) {
      // 开始轮询检查任务状态
      while (isGenerating) {
        try {
          const statusResponse = await apiClient.get(`/api/generate/status?taskId=${response.data.taskId}`);
          
          if (statusResponse.data.status === 'completed') {
            setResult(statusResponse.data.result);
            toast.success(`${type === 'advanced' ? 'Advanced' : 'Basic'} image generated successfully`);
            setIsGenerating(false);
            break;
          }
          
          if (statusResponse.data.status === 'failed') {
            toast.error(statusResponse.data.error || 'Generation failed');
            setIsGenerating(false);
            break;
          }
          
          // 等待一秒后继续检查
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('Status check error:', error);
          toast.error('Failed to check generation status');
          setIsGenerating(false);
          break;
        }
      }
    } else {
      throw new Error('Invalid response format')
    }

  } catch (error) {
    console.error('Generation error:', error)
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        router.push(config.auth.loginUrl)
        return
      }
      const errorMessage = error.response?.data instanceof Blob 
        ? await error.response.data.text() 
        : error.response?.data?.error || 'Failed to generate image'
      console.error('Error details:', errorMessage)
      toast.error(errorMessage)
    } else {
      toast.error('Failed to generate image. Please try again.')
    }
    setIsGenerating(false)
  }
}

// 组件卸载时清理
useEffect(() => {
  return () => {
    setIsGenerating(false); // 确保组件卸载时停止轮询
    if (result) {
      URL.revokeObjectURL(result);
    }
  };
}, [result]);
```

#### 状态控制的优点
1. **简洁性**
   - 复用已有的 `isGenerating` 状态
   - 避免引入额外的状态变量
   - 代码逻辑清晰

2. **可靠性**
   - 组件卸载时自动停止轮询
   - 完整的错误处理
   - 资源自动清理

3. **用户体验**
   - 生成过程中显示加载状态
   - 适当的成功/错误提示
   - 状态反馈及时

4. **性能考虑**
   - 避免不必要的轮询
   - 及时清理资源
   - 合理的轮询间隔

### 3. 数据库架构
```sql
/**
 * 图片生成任务表
 * 用于跟踪和管理图片生成的状态和结果
 */

-- 创建状态枚举类型
CREATE TYPE public.generation_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- 创建图片生成表
CREATE TABLE public.image_generations (
  -- 标识和关系字段
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  
  -- 业务字段
  task_id text UNIQUE NOT NULL,
  status generation_status NOT NULL DEFAULT 'pending',
  result text,
  error text,
  prompt text,
  
  -- 元数据字段（Supabase 标准）
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 添加 RLS 策略
ALTER TABLE public.image_generations ENABLE ROW LEVEL SECURITY;

-- 创建访问策略
CREATE POLICY "Users can view their own generations"
  ON public.image_generations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations"
  ON public.image_generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 添加索引
CREATE INDEX idx_image_generations_task_id ON public.image_generations(task_id);
CREATE INDEX idx_image_generations_user_status ON public.image_generations(user_id, status);

-- 创建更新时间触发器
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.image_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 添加状态检查约束
ALTER TABLE public.image_generations
  ADD CONSTRAINT check_result_on_completed
  CHECK (
    (status = 'completed' AND result IS NOT NULL) OR
    (status != 'completed')
  );

-- 创建清理函数（可选）
CREATE OR REPLACE FUNCTION public.cleanup_old_generations()
RETURNS void AS $$
BEGIN
  DELETE FROM public.image_generations
  WHERE created_at < timezone('utc'::text, now()) - INTERVAL '7 days'
    AND status IN ('completed', 'failed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

主要改动说明：

1. **Supabase 标准**
   - 使用 `public` schema
   - 使用 Supabase 的 RLS (Row Level Security)
   - 使用 `extensions.uuid_generate_v4()`
   - 使用 `extensions.moddatetime()` 处理更新时间

2. **安全性**
   - 启用行级安全
   - 添加访问策略
   - 使用 `SECURITY DEFINER` 的清理函数

3. **字段标准化**
   - 使用 `timestamptz` 和 UTC 时间
   - 非空约束 (`NOT NULL`)
   - 统一的命名规范

4. **性能优化**
   - 合适的索引设计
   - 优化的触发器实现
   - 使用 Supabase 内置扩展

## 长轮询的优势

1. **简单性**
   - 比 WebSocket 或 SSE 更容易实现
   - 使用标准 HTTP 协议
   - 兼容所有浏览器和客户端

2. **可靠性**
   - 网络问题时自动重连
   - 更好的超时处理
   - 对代理和防火墙更友好

3. **可扩展性**
   - 比 WebSocket 资源消耗更少
   - 更容易负载均衡
   - 更好的服务器资源控制

## 实现细节

### 1. 错误处理
```typescript
// 客户端错误处理
const handleGenerate = async () => {
  try {
    // 初始请求
    const { data: { taskId } } = await apiClient.post('/api/generate', formData);
    
    // 开始轮询
    const result = await pollStatus(taskId);
    setResult(result);
    toast.success('图片生成成功');
    
  } catch (error) {
    console.error('生成错误:', error);
    toast.error(error.message || '图片生成失败');
  } finally {
    setIsGenerating(false);
  }
};
```

### 2. 超时管理
- 服务端超时：30秒/请求
- 客户端超时：20次轮询尝试
- 轮询间隔：1秒
- 总最大时间：约10分钟

### 3. 资源管理
```typescript
// 清理之前的结果
useEffect(() => {
  return () => {
    if (result) {
      URL.revokeObjectURL(result);
    }
  };
}, [result]);
```

## 最佳实践

1. **指数退避**
   - 连续失败时增加轮询间隔
   - 防止服务器过载
   ```typescript
   const getBackoffTime = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000);
   ```

2. **连接管理**
   - 优雅处理网络错误
   - 实现重试逻辑
   - 组件卸载时清理超时

3. **性能优化**
   - 使用合适的轮询间隔
   - 实现请求取消
   - 适当缓存结果

4. **安全考虑**
   - 服务端验证 taskId
   - 实现速率限制
   - 检查用户权限

## 迁移步骤

1. **数据库设置**
   - 创建 image_generations 表
   - 添加必要索引
   - 设置 updated_at 触发器

2. **后端实现**
   - 创建状态检查端点
   - 实现轮询逻辑
   - 添加错误处理

3. **前端更新**
   - 修改生成函数
   - 实现轮询机制
   - 更新 UI 状态反馈

4. **测试**
   - 测试超时场景
   - 验证错误处理
   - 检查资源清理

## 监控和维护

1. **需要跟踪的指标**
   - 平均处理时间
   - 轮询频率
   - 错误率
   - 超时发生次数

2. **日志记录**
   - 请求/响应周期
   - 错误情况
   - 性能指标
   - 资源使用情况

3. **优化机会**
   - 调整超时值
   - 微调轮询间隔
   - 优化数据库查询
   - 实现缓存

## 未来改进

1. **增强状态更新**
   - 进度百分比
   - 预计剩余时间
   - 详细状态消息

2. **性能优化**
   - 批量状态检查
   - 实现缓存层
   - 优化数据库查询

3. **用户体验**
   - 进度指示器
   - 取消支持
   - 更好的错误提示 
