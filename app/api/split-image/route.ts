import sharp from 'sharp';
import archiver from 'archiver';
import { NextRequest, NextResponse } from 'next/server';

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
    
    // 验证图片尺寸
    if (!width || !height) {
      throw new Error('Invalid image dimensions');
    }

    // // 确保宽高能被5整除，避免小数点问题
    // const adjustedWidth = Math.floor(width / 5) * 5;
    // const adjustedHeight = Math.floor(height / 5) * 5;
    
    // // 调整图片大小为能被5整除的尺寸
    // const resizedImage = await image
    //   .resize(adjustedWidth, adjustedHeight, {
    //     fit: 'contain',
    //     background: { r: 255, g: 255, b: 255, alpha: 0 }
    //   })
    //   .toBuffer();
    
    // // 使用调整后的图片
    // const processImage = sharp(resizedImage);
    
    // // 计算每个切片的尺寸
    // const sliceWidth = adjustedWidth / 5;
    // const sliceHeight = adjustedHeight / 5;
    const processImage = image;
    const adjustedWidth = 640;
    const adjustedHeight = 640;
    const sliceWidth = 128;
    const sliceHeight = 128;
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
        const left = col * sliceWidth;
        const top = row * sliceHeight;
        
        // 验证切割区域
        if (left + sliceWidth <= adjustedWidth && top + sliceHeight <= adjustedHeight) {
          const slicePromise = processImage
            .clone()  // 创建新的处理实例
            .extract({
              left: Math.round(left),
              top: Math.round(top),
              width: Math.round(sliceWidth),
              height: Math.round(sliceHeight)
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
    }
    
    // 等待所有切片处理完成
    await Promise.all(slicePromises);
    
    // 完成 zip 文件
    archive.finalize();
    
    // 创建可读流
    const chunks: Buffer[] = [];
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // 等待 zip 完成
    const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
    });
    
    // 返回 zip 文件
    return NextResponse.json({
      data: {
        zipBase64: zipBuffer.toString('base64')
      }
    });
    
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image'
    }, { status: 500 });
  }
} 