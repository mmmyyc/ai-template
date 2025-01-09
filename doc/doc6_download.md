# 图片切割与打包下载方案

## 功能需求
1. 将生成的图片切割为 5x5 的网格（25张子图片）
2. 将切割后的图片按顺序命名（shime1.png 到 shime25.png）
3. 打包所有图片为一个 zip 文件
4. 提供单个 zip 文件下载

## 实现方案

### 1. 后端实现 (`app/api/split-image/route.ts`)
```typescript
import sharp from 'sharp';
import archiver from 'archiver';
import { Readable } from 'stream';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const imageData = data.get('image') as File;
    
    // 读取图片数据
    const buffer = await imageData.arrayBuffer();
    const image = sharp(Buffer.from(buffer));
    
    // 获取图片信息
    const metadata = await image.metadata();
    const { width = 0, height = 0 } = metadata;
    
    // 计算每个切片的尺寸
    const sliceWidth = Math.floor(width / 5);
    const sliceHeight = Math.floor(height / 5);
    
    // 创建 zip 文件
    const archive = archiver('zip', {
      zlib: { level: 9 } // 最高压缩级别
    });
    
    // 存储所有切片的 Promise
    const slicePromises = [];
    let sliceIndex = 1;
    
    // 切割图片
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const slicePromise = image
          .extract({
            left: col * sliceWidth,
            top: row * sliceHeight,
            width: sliceWidth,
            height: sliceHeight
          })
          .toBuffer()
          .then(buffer => {
            // 添加到 zip
            archive.append(buffer, { name: `img/shime${sliceIndex}.png` });
            sliceIndex++;
          });
        slicePromises.push(slicePromise);
      }
    }
    
    // 等待所有切片处理完成
    await Promise.all(slicePromises);
    
    // 完成 zip 文件
    archive.finalize();
    
    // 创建可读流
    const chunks: Uint8Array[] = [];
    archive.on('data', (chunk) => chunks.push(chunk));
    
    // 等待 zip 完成
    const zipBuffer = await new Promise((resolve, reject) => {
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
    });
    
    // 返回 zip 文件
    return new NextResponse({data: zipBuffer}, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=shime_images.zip'
      }
    });
    
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process image'
    }, { status: 500 });
  }
}
```

### 2. 前端实现
```typescript
const handleDownload = async () => {
  if (!result) return;
  
  try {
    // 获取图片数据
    const response = await fetch(result);
    const blob = await response.blob();
    
    // 创建 FormData
    const formData = new FormData();
    formData.append('image', blob, 'image.png');
    
    // 发送切割请求并下载 zip
    const splitResponse = await apiClient.post('/split-image', formData, {
      responseType: 'blob'
    });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([splitResponse.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shime_images.zip';
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Images downloaded successfully');
  } catch (error) {
    console.error('Error downloading images:', error);
    toast.error('Failed to download images');
  }
};
```

## 关键特性
1. 顺序命名
   - 图片按 shime1.png 到 shime25.png 顺序命名
   - 保持命名简单直观

2. 目录结构
   ```
   shime_images.zip
   └── img/
       ├── shime1.png
       ├── shime2.png
       ...
       └── shime25.png
   ```

3. 性能优化
   - 使用流式处理
   - 并行处理切片
   - 高效压缩

4. 用户体验
   - 单个文件下载
   - 进度提示
   - 错误处理

## 依赖项
```json
{
  "dependencies": {
    "sharp": "^0.32.6",
    "archiver": "^5.3.1"
  }
}
```

## 注意事项
1. 确保图片尺寸足够大，以保证切割质量
2. 处理大图片时可能需要更长时间
3. 考虑添加进度提示
4. 注意内存使用

## 后续优化
1. 添加进度条显示
2. 支持自定义文件名前缀
3. 添加图片预处理选项
4. 支持不同的压缩级别
5. 添加预览功能