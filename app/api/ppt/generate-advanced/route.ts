import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';

interface ProcessedSlide {
  id: string;
  title: string;
  content: string;
  parsedContent?: {
    title: string;
    textElements: any[];
    images: any[];
    styles: any;
    layout: any;
  };
  previewImage?: string;
  metadata?: {
    width: number;
    height: number;
    aspectRatio: string;
  };
}

interface GenerateOptions {
  format: 'pptx';
  quality: 'high' | 'medium' | 'low';
  preserveAnimations: boolean;
  optimizeImages: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { slides, folderName, options }: {
      slides: ProcessedSlide[];
      folderName: string;
      options: GenerateOptions;
    } = await req.json();

    if (!slides || slides.length === 0) {
      return NextResponse.json(
        { error: 'No slides provided' },
        { status: 400 }
      );
    }

    // 创建新的PPT实例
    const pptx = new PptxGenJS();
    
    // 设置PPT属性
    pptx.author = 'SlidesCraft';
    pptx.company = 'SlidesCraft';
    pptx.title = folderName;
    pptx.subject = 'Generated from HTML slides';

    // 处理每个幻灯片
    for (let i = 0; i < slides.length; i++) {
      const slideData = slides[i];
      const slide = pptx.addSlide();

      try {
        if (slideData.parsedContent) {
          // 使用解析后的内容创建结构化幻灯片
          await createStructuredSlide(slide, slideData.parsedContent, options);
        } else if (slideData.previewImage) {
          // 使用预览图创建图片幻灯片
          await createImageSlide(slide, slideData.previewImage, slideData.title);
        } else {
          // 回退到简单文本幻灯片
          createSimpleTextSlide(slide, slideData.title, slideData.content);
        }
      } catch (error) {
        console.error(`Error processing slide ${i + 1}:`, error);
        // 创建错误幻灯片
        createErrorSlide(slide, slideData.title, error);
      }
    }

    // 生成PPT文件
    const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;

    // 返回文件
    return new NextResponse(pptxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${folderName}-${new Date().toISOString().slice(0, 10)}.pptx"`,
        'Content-Length': pptxBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating advanced PPT:', error);
    return NextResponse.json(
      { error: 'Failed to generate PPT: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// 创建结构化幻灯片
async function createStructuredSlide(slide: any, parsedContent: any, options: GenerateOptions) {
  const { textElements, images, styles, layout } = parsedContent;

  // 设置背景
  if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
    slide.background = { color: convertColorToPptx(styles.backgroundColor) };
  }

  // 添加文本元素
  textElements.forEach((textElement: any, index: number) => {
    const textOptions = {
      x: convertPixelsToInches(textElement.position.x),
      y: convertPixelsToInches(textElement.position.y),
      w: convertPixelsToInches(textElement.position.width),
      h: convertPixelsToInches(textElement.position.height),
      fontSize: convertPixelsToPoints(textElement.styles.fontSize),
      fontFace: textElement.styles.fontFamily.split(',')[0].replace(/['"]/g, ''),
      color: convertColorToPptx(textElement.styles.color),
      bold: textElement.styles.fontWeight === 'bold' || parseInt(textElement.styles.fontWeight) >= 600,
      align: convertTextAlign(textElement.styles.textAlign),
    };

    slide.addText(textElement.content, textOptions);
  });

  // 添加图片
  for (const image of images) {
    try {
      if (image.src.startsWith('data:')) {
        // Base64图片
        slide.addImage({
          data: image.src,
          x: convertPixelsToInches(image.position.x),
          y: convertPixelsToInches(image.position.y),
          w: convertPixelsToInches(image.width),
          h: convertPixelsToInches(image.height),
        });
      } else if (image.src.startsWith('http')) {
        // 网络图片
        slide.addImage({
          path: image.src,
          x: convertPixelsToInches(image.position.x),
          y: convertPixelsToInches(image.position.y),
          w: convertPixelsToInches(image.width),
          h: convertPixelsToInches(image.height),
        });
      }
    } catch (error) {
      console.error('Error adding image:', error);
    }
  }
}

// 创建图片幻灯片
async function createImageSlide(slide: any, previewImage: string, title: string) {
  // 添加标题
  if (title) {
    slide.addText(title, {
      x: 0.5,
      y: 0.2,
      w: 9,
      h: 0.8,
      fontSize: 24,
      bold: true,
      align: 'center',
    });
  }

  // 添加预览图
  slide.addImage({
    data: previewImage,
    x: 0.5,
    y: title ? 1.2 : 0.5,
    w: 9,
    h: title ? 5.8 : 6.5,
  });
}

// 创建简单文本幻灯片
function createSimpleTextSlide(slide: any, title: string, content: string) {
  // 添加标题
  if (title) {
    slide.addText(title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 1,
      fontSize: 28,
      bold: true,
      align: 'center',
    });
  }

  // 提取纯文本内容
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  if (textContent) {
    slide.addText(textContent, {
      x: 0.5,
      y: title ? 2 : 1,
      w: 9,
      h: title ? 4.5 : 5.5,
      fontSize: 18,
      align: 'left',
    });
  }
}

// 创建错误幻灯片
function createErrorSlide(slide: any, title: string, error: any) {
  slide.addText(title || 'Slide Error', {
    x: 0.5,
    y: 1,
    w: 9,
    h: 1,
    fontSize: 24,
    bold: true,
    color: 'FF0000',
    align: 'center',
  });

  slide.addText(`Error processing slide: ${error.message || 'Unknown error'}`, {
    x: 0.5,
    y: 3,
    w: 9,
    h: 2,
    fontSize: 14,
    color: '666666',
    align: 'center',
  });
}

// 工具函数
function convertPixelsToInches(pixels: number): number {
  return pixels / 96; // 96 DPI
}

function convertPixelsToPoints(pixelSize: string): number {
  const pixels = parseInt(pixelSize.replace('px', ''));
  return Math.round(pixels * 0.75); // 1px = 0.75pt
}

function convertColorToPptx(color: string): string {
  // 简单的颜色转换
  if (color.startsWith('rgb(')) {
    const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (matches) {
      const r = parseInt(matches[1]).toString(16).padStart(2, '0');
      const g = parseInt(matches[2]).toString(16).padStart(2, '0');
      const b = parseInt(matches[3]).toString(16).padStart(2, '0');
      return r + g + b;
    }
  } else if (color.startsWith('#')) {
    return color.substring(1);
  }
  return '000000'; // 默认黑色
}

function convertTextAlign(align: string): 'left' | 'center' | 'right' {
  switch (align) {
    case 'center':
      return 'center';
    case 'right':
      return 'right';
    default:
      return 'left';
  }
} 