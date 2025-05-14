import { NextRequest, NextResponse } from 'next/server';
import pptxgen from 'pptxgenjs';
import { JSDOM } from 'jsdom';

export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const body = await req.json();
    const { slides, folderName, preprocessed = false, format = 'svg' } = body;
    
    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: '没有提供幻灯片数据' }, { status: 400 });
    }

    // 创建PPT实例
    const pptx = new pptxgen();
    
    // 设置默认的幻灯片尺寸 (16:9)
    pptx.layout = 'LAYOUT_16x9';
    
    // 处理每个幻灯片
    for (const slide of slides) {
      try {
        // 创建一个新的幻灯片
        const pptSlide = pptx.addSlide();
        
        // 如果是前端预处理过的
        if (preprocessed) {
          try {
            // 检查是PNG还是SVG格式
            if (format === 'png' && slide.pngBase64) {
              // 使用PNG图片数据
              const imgData = `data:image/png;base64,${slide.pngBase64}`;
              
              // 优化图片添加方式，保持高清晰度
              pptSlide.addImage({ 
                data: imgData,
                x: 0, 
                y: 0, 
                w: '100%',
                h: '100%',
                sizing: { type: 'contain', w: '100%', h: '100%' } // 保持长宽比并确保高质量显示
              });
              
              // // 添加标题作为备用（如果图片加载失败）
              // if (slide.title) {
              //   pptSlide.addText(slide.title, {
              //     x: 0.5,
              //     y: 0.3,
              //     w: '90%',
              //     h: 0.5,
              //     fontSize: 24,
              //     bold: true,
              //     color: '363636',
              //     transparency: 85, // 大部分透明，除非图片无法加载
              //   });
              // }
              
              continue; // 跳过后续处理
            } 
            else if (slide.svgContent) {
              // 向后兼容: 如果有SVG内容，则使用SVG
              const dataUrl = `data:image/svg+xml;base64,${slide.svgContent}`;
              
              // 添加SVG图片到PPT
              pptSlide.addImage({
                data: dataUrl,
                x: 0,
                y: 0,
                w: '100%',
                h: '100%'
              });
              
              continue; // 跳过后续处理
            }
          } catch (imgError) {
            console.error('添加图片失败:', imgError);
            // 继续使用备选文本方式
          }
        }

        // 直接添加标题和文本作为备选
        pptSlide.addText(slide.title || '幻灯片', { 
          x: 0.5, 
          y: 0.5, 
          w: '90%', 
          h: 1, 
          fontSize: 24,
          bold: true,
          color: '363636' 
        });
        
        try {
          // 使用一个简单的正则表达式从HTML中提取文本
          const textContent = slide.content
            .replace(/<[^>]*>/g, ' ') // 去除HTML标签
            .replace(/\s+/g, ' ')     // 合并空白字符
            .trim();
            
          if (textContent) {
            pptSlide.addText(textContent.substring(0, 500) + (textContent.length > 500 ? '...' : ''), { 
              x: 0.5, 
              y: 1.5, 
              w: '90%', 
              h: 4, 
              fontSize: 14,
              color: '666666',
              breakLine: true
            });
          }
        } catch (textError) {
          console.error('提取文本内容失败:', textError);
        }
      } catch (error) {
        console.error('处理幻灯片时出错:', error);
        // 继续处理下一张幻灯片
      }
    }
    
    try {
      // 直接导出为buffer，不再尝试复杂的导出方法
      // @ts-ignore
      const pptxData = await pptx.write('nodebuffer');
      
      // 确保文件名只包含ASCII字符
      const safeFileName = folderName.replace(/[^\x20-\x7E]/g, '_') + '-' + 
        new Date().toISOString().slice(0, 10) + '.pptx';
      
      return new NextResponse(pptxData, {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="${safeFileName}"`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        },
      });
    } catch (exportError) {
      console.error('PPT导出失败:', exportError);
      
      // 如果导出失败，返回错误响应
      return NextResponse.json({ 
        error: '无法生成PPT文件。请尝试下载为PNG格式。' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('生成PPT时出错:', error);
    return NextResponse.json({ error: `生成PPT时出错: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
  }
}