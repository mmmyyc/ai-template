import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readFile, rm, writeFile, readdir } from 'fs/promises';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// 初始化 S3 客户端
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  const tempDir = path.join(os.tmpdir(), 'shimeji-' + Date.now());
  const tempImgDir = path.join(tempDir, 'img');
  
  try {
    const data = await request.formData();
    const imageData = data.get('image') as File;
    const type = data.get('type') as string;

    // 生成唯一的文件名
    const imageHash = await generateHash(await imageData.arrayBuffer());
    const zipKey = `processed/${type}/${imageHash}.zip`;

    // 检查是否已存在处理好的文件
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: zipKey,
      });
      await s3Client.send(headCommand);

      // 如果文件存在，生成签名 URL 并返回
      const getCommand = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: zipKey,
      });
      const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
      
      return NextResponse.json({
        data: {
          zipBase64: null,
          signedUrl
        }
      });
    } catch (error) {
      // 文件不存在，继续处理
      console.log('File not found in bucket, processing...');
    }

    // 以下是原有的处理逻辑
    await mkdir(tempImgDir, { recursive: true });
    
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

    let processImage = image;
    let adjustedWidth = 640;
    let adjustedHeight = 640;
    let sliceWidth = 128;
    let sliceHeight = 128;
    if(type === 'advanced'){
      processImage = image;
      adjustedWidth = 640;
      adjustedHeight = 1280;
      sliceWidth = 128;
      sliceHeight = 128;
    }

    
    // 存储所有切片的 Promise
    const slicePromises = [];
    let sliceIndex = 1;
    let n = 5;
    let m = 5;
    if(type === 'advanced'){
      n = 10;
      m = 5;
    }
    // 切割图片并保存到临时目录
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < m; col++) {
        const left = col * sliceWidth;
        const top = row * sliceHeight;
        
        if (left + sliceWidth <= adjustedWidth && top + sliceHeight <= adjustedHeight) {
          const slicePromise = processImage
            .clone()
            .extract({
              left: Math.round(left),
              top: Math.round(top),
              width: Math.round(sliceWidth),
              height: Math.round(sliceHeight)
            })
            .toFile(path.join(tempImgDir, `shime${sliceIndex}.png`));
          if(row * m + col < 46 ){
            slicePromises.push(slicePromise);
            sliceIndex++;
          }
        }
      }
    }
    
    // 等待所有切片处理完成
    await Promise.all(slicePromises);
    
    // 根据类型使用对应的预处理zip文件
    const baseZipPath = path.join(process.cwd(), 'public', 
      type === 'basic' ? 'shimejiee-basic.zip' : 'shimejiee-advanced.zip'
    );
    const baseZipBuffer = await readFile(baseZipPath);
    
    // 保存到临时文件
    const tempZipPath = path.join(tempDir, 'shimejiee.zip');
    await writeFile(tempZipPath, baseZipBuffer);
    
    // 使用 adm-zip 处理 zip 文件
    const zip = new AdmZip(tempZipPath);
    
    // 直接添加新的切割图片到 zip
    const imgFiles = await readdir(tempImgDir);
    for (const file of imgFiles) {
      const imgPath = path.join(tempImgDir, file);
      const imgContent = await readFile(imgPath);
      zip.addFile(`shimejiee/img/shimeji/${file}`, imgContent);
    }
    
    // 保存修改后的 zip
    const modifiedZipBuffer = zip.toBuffer();

    // 上传到存储桶时添加过期时间
    const putCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: zipKey,
      Body: modifiedZipBuffer,
      ContentType: 'application/zip',
      Expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      Metadata: {
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    await s3Client.send(putCommand);

    // 生成签名下载 URL
    const getCommand = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: zipKey,
    });
    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

    // 清理临时文件
    await rm(tempDir, { recursive: true, force: true });
    
    return NextResponse.json({
      data: {
        zipBase64: modifiedZipBuffer.toString('base64'),
        signedUrl
      }
    });
    
  } catch (error) {
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Error cleaning up:', cleanupError);
    }
    
    console.error('Error processing image:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image'
    }, { status: 500 });
  }
}

// 辅助函数：生成文件哈希
async function generateHash(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
} 