import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readFile, rm, writeFile, readdir } from 'fs/promises';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';

export async function POST(request: NextRequest) {
  const tempDir = path.join(os.tmpdir(), 'shimeji-' + Date.now());
  const tempImgDir = path.join(tempDir, 'img');
  
  try {
    const data = await request.formData();
    const imageData = data.get('image') as File;
    const type = data.get('type') as string;
    // 创建临时目录
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
    
    // 下载原始的 shimejiee.zip
    const shimejeeResponse = await fetch('https://kilkakon.com/shimeji/shimejiee.zip');
    const shimejeeBuffer = await shimejeeResponse.arrayBuffer();
    
    // 保存到临时文件
    const tempZipPath = path.join(tempDir, 'shimejiee.zip');
    await writeFile(tempZipPath, Buffer.from(shimejeeBuffer));
    
    // 使用 adm-zip 处理 zip 文件
    const zip = new AdmZip(tempZipPath);
    if(type === 'basic'){
      // 删除前25张图片
      for (let i = 1; i <= 25; i++) {
        const fileName = `img/shimeji/shime${i}.png`;
        zip.deleteFile(fileName);
      }
    }else if(type === 'advanced'){
      // 删除前46张图片
      for (let i = 1; i <= 46; i++) {
        const fileName = `img/shimeji/shime${i}.png`;
        zip.deleteFile(fileName);
      }
    }
    
    // 读取临时目录中的所有切割图片并添加到 zip
    const imgFiles = await readdir(tempImgDir);
    for (const file of imgFiles) {
      const imgPath = path.join(tempImgDir, file);
      const imgContent = await readFile(imgPath);
      zip.addFile(`img/shimeji/${file}`, imgContent);
    }
    
    // 保存修改后的 zip
    const modifiedZipBuffer = zip.toBuffer();
    
    // 清理临时文件
    await rm(tempDir, { recursive: true, force: true });
    
    // 返回修改后的 zip 文件
    return NextResponse.json({
      data: {
        zipBase64: modifiedZipBuffer.toString('base64')
      }
    });
    
  } catch (error) {
    // 确保清理临时文件
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