-- 向image_generations表添加is_shared字段
ALTER TABLE public.image_generations 
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;

-- 创建索引以提高查询效率
CREATE INDEX IF NOT EXISTS idx_image_generations_is_shared 
ON public.image_generations(is_shared);

-- 更新RLS政策以允许公开访问共享内容
CREATE POLICY "允许公开查看已共享的生成内容" 
ON public.image_generations
FOR SELECT
USING (is_shared = TRUE);

-- 确保所有人可以看到共享的内容，包括未登录用户
ALTER TABLE public.image_generations ENABLE ROW LEVEL SECURITY; 