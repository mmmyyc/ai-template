import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readFile, rm, writeFile, readdir } from 'fs/promises';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';

export async function POST(request: NextRequest) {
  const tempDir = path.join(os.tmpdir(), 'shimeji-' + Date.now());
  const tempImgDir = path.join(tempDir, 'img');
  console.log('Created temp directories:', { tempDir, tempImgDir });
  
  try {
    const data = await request.formData();
    const imageData = data.get('image') as File;
    const type = data.get('type') as string;
    console.log('Received request data:', { type, imageSize: imageData?.size });

    // 验证类型参数
    if (!type || !['basic', 'advanced'].includes(type)) {
      console.error('Invalid type:', type);
      throw new Error('Invalid type parameter. Must be either "basic" or "advanced"');
    }

    // 生成唯一的文件名
    const imageHash = await generateHash(await imageData.arrayBuffer());
    const zipKey = `processed/${type}/${imageHash}.zip`;
    console.log('Generated file path:', { zipKey });
    
    // 以下是原有的处理逻辑
    await mkdir(tempImgDir, { recursive: true });
    
    // 读取图片数据
    const buffer = await imageData.arrayBuffer();
    const image = sharp(Buffer.from(buffer));
    console.log('Image loaded with sharp');
    
    // 获取图片信息
    const metadata = await image.metadata();
    const { width = 0, height = 0 } = metadata;
    console.log('Image metadata:', { width, height, format: metadata.format });
    
    // 验证图片尺寸
    if (!width || !height) {
      console.error('Invalid image dimensions:', metadata);
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
    console.log('Processing image slices...');
    await Promise.all(slicePromises);
    console.log('All slices processed successfully');
    
    // 根据类型使用对应的预处理zip文件
    const baseZipPath = path.join(process.cwd(), 'public', 
      type === 'basic' ? 'shimejiee-basic.zip' : 'shimejiee-advanced.zip'
    );
    console.log('Using base zip file:', baseZipPath);
    
    try {
      const baseZipBuffer = await readFile(baseZipPath);
      console.log('Base zip file loaded successfully');
      
      // 保存到临时文件
      const tempZipPath = path.join(tempDir, 'shimejiee.zip');
      await writeFile(tempZipPath, baseZipBuffer);
      console.log('Temporary zip file created');
      
      // 使用 adm-zip 处理 zip 文件
      const zip = new AdmZip(tempZipPath);
      
      // 直接添加新的切割图片到 zip
      const imgFiles = await readdir(tempImgDir);
      console.log('Found image files to add:', imgFiles.length);
      
      for (const file of imgFiles) {
        const imgPath = path.join(tempImgDir, file);
        const imgContent = await readFile(imgPath);
        zip.addFile(`shimejiee/img/shimeji/${file}`, imgContent);
      }
      console.log('All images added to zip');
      
      // 保存修改后的 zip
      const modifiedZipBuffer = zip.toBuffer();
      console.log('Created final zip buffer, size:', modifiedZipBuffer.length);

      // 清理临时文件
      await rm(tempDir, { recursive: true, force: true });
      console.log('Cleaned up temporary files');
      
      return NextResponse.json({
        data: {
          zipBase64: modifiedZipBuffer.toString('base64')
        }
      });
    } catch (processError) {
      console.error('Error during zip processing:', processError);
      throw processError;
    }
    
  } catch (error) {
    console.error('Main process error:', error);
    try {
      await rm(tempDir, { recursive: true, force: true });
      console.log('Cleaned up temporary files after error');
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    
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