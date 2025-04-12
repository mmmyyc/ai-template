export const promptCard = (language: string, style: string ) => `
# 创建单页HTML卡片 - 卡片生成提示词 (v3 - 内容智能提取)

目标：根据提供的内容，创建一个视觉吸引、信息清晰的单页HTML卡片。

## 语言设置
* 卡片显示语言：${language}
* 代码注释语言：${language}

## 交付规格
* 单一HTML文件，可直接在浏览器中打开
* 所有样式、脚本内嵌于文件中
* 无需额外下载或安装即可查看

## 内容智能处理 (核心功能)
1. **内容分析与提取**：
   * **标题识别**：自动识别并提取主标题和副标题
   * **要点归纳**：提取3-7个核心观点或信息点
   * **数据识别**：检测可视化的数据点和关系
   * **引述提取**：识别重要引述或强调内容

2. **结构优化**：
   * **层次分明**：清晰的信息层级结构
   * **视觉重点**：突出核心信息和关键数据
   * **内容平衡**：文本与视觉元素的合理分配
   * **空间利用**：高效利用有限空间展示信息
   * **内容完整**：确保内容完整性，不遗漏任何重要信息
## 设计规范
* **设计风格**：${style}
* **比例要求**：严格保持3:4的宽高比
* **排版标准**：
  * 标题：醒目、简洁，推荐24-36px
  * 正文：清晰可读，最小24px
  * 行高：推荐1.8倍，确保舒适阅读体验
* **色彩原则**：
  * 符合${style}风格的色彩方案
  * 确保文本与背景对比度满足可读性标准
  * 使用色彩突出重点内容

## 技术实现
1. **基础框架**：HTML5 + 内嵌CSS + 最小化JavaScript
2. **必要CDN引入**：
   * Tailwind CSS: \`<script src="https://cdn.tailwindcss.com"></script>\`
   * Font Awesome: \`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\`
   * Google Fonts: \`<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">\`

3. **数据可视化(智能判断)**：
   * 自动分析内容是否适合图表展示
   * 如需图表，引入Chart.js: \`<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\`
   * 根据数据特性选择合适图表类型(柱状图/饼图/折线图等)

4. **动效设计**：
   * 为关键元素添加入场动画(淡入、平移等)
   * 动画时长控制在300-800ms，确保流畅不突兀
   * 遵循"少即是多"原则，避免过度动画干扰内容

## 响应式与兼容性
* 在保持 **3:4** 比例的前提下支持响应式设计
* 兼容Chrome, Firefox, Safari和Edge最新版本
* 针对高分辨率屏幕优化显示效果

## 输出格式
* 直接返回完整、可运行的HTML代码
* 包含适当注释，便于后期编辑
* 不包含额外说明或markdown标记

---
## 内容
请根据以下提供的内容生成卡片：
`;