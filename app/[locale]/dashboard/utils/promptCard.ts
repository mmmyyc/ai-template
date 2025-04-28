export const promptCard = (language: string, style: string ) => `
# 创建单页HTML卡片 - 卡片生成提示词 (v4.1 - 响应式宽高)

目标：能够将用户提供的内容转化为视觉吸引、信息清晰的单页HTML卡片。请严格按照以下规范执行。

## 核心任务
根据我提供的"内容"部分，生成一个信息丰富、结构清晰且视觉吸引人的HTML卡片。

## 语言设置
* 卡片显示语言：${language}
* 代码注释语言：${language}

## 交付规格
* 单一HTML文件，可直接在浏览器中打开
* 所有样式、脚本内嵌于文件中
* 无需额外下载或安装即可查看

## 内容智能处理与结构化 (核心功能)
1. **内容分析与精准提取**：
   * **标题识别**：仔细分析并精准提取主标题和副标题，确保核心主题突出
   * **要点归纳**：提取3-7个核心观点或信息点，优先使用列表（ul或ol）展示
   * **数据识别**：**自主判断**内容中是否存在适合用图表展示的数据系列
   * **引述提取**：识别重要引述或强调内容，使用适当样式突出显示

2. **结构优化**：
   * **标题区域**：清晰、显著地展示主标题和副标题
   * **主体内容区**：展示核心要点列表、关键段落、数据可视化等
   * **层次分明**：清晰的信息层级结构，便于快速理解
   * **视觉重点**：突出核心信息和关键数据
   * **内容平衡**：文本与视觉元素的合理分配，避免过度拥挤或过于空旷
   * **空间利用**：高效利用有限空间展示信息
   * **内容完整**：确保内容完整性，不遗漏任何重要信息

## 设计规范
* **设计风格**：采用 **${style}** 的风格。注重清晰的视觉层次和良好的可读性。
* **内容优先原则**：所有设计决策都应服务于内容的清晰传达。**内容是主体，设计是辅助。**
* **布局参考 (响应式宽度，高度自适应)**：
  <body class="flex items-center justify-center min-h-screen font-sans bg-gray-100 p-4"> 
      <div class="w-full max-w-md h-auto bg-white shadow-lg rounded-lg overflow-hidden p-6"> 
         <!-- 卡片内容放在这里，高度将根据内容自动调整 -->
      </div>
  </body>
* **尺寸要求**：卡片宽度建议设定最大值（如 \`max-w-md\`, \`max-w-lg\`）以保证在大屏幕上的可读性，并允许在小屏幕上宽度自适应（如 \`w-full\`）。**高度必须自适应 (h-auto)**，由内容决定。
* **排版标准**：
  * 标题：醒目、简洁，使用text-xl至text-3xl等Tailwind类
  * 正文：清晰可读，使用text-sm或text-base等Tailwind类
  * 行高：使用leading-relaxed或leading-loose等Tailwind类，确保舒适阅读体验
* **色彩原则**：
  * 符合${style}风格的色彩方案
  * 确保文本与背景对比度满足可读性标准
  * 使用色彩突出重点内容
* **背景与边框**: 
  * **克制使用**：背景色应与整体风格协调，避免使用过于饱和或刺眼的颜色
  * 边框应细致（例如使用\`border\`或\`border-2\`类），颜色不宜过深，或根据设计风格省略边框
* **样式实现**: **强制要求**所有布局、颜色、字体、间距等样式**必须**通过**Tailwind CSS类**实现。**严禁**使用自定义CSS(\`<style>\`标签或\`style\`属性)来实现这些基础样式。
* **自定义CSS限制**: 自定义CSS(包括\`<style>\`标签或\`style\`属性)**只能**用于实现**动画效果**。

## 技术实现
1. **基础框架**：HTML5 + Tailwind CSS + 最小化JavaScript
2. **必要CDN引入**：
   * Tailwind CSS: \`<script src="https://cdn.tailwindcss.com"></script>\`
   * Lucide 图标: \`<script src="https://unpkg.com/lucide@latest"></script><script>lucide.createIcons();</script>\` (使用方法见下文)
   * Google Fonts: \`<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">\`

3. **Lucide 图标使用说明**:
   * 在HTML中插入图标，使用 \`<i>\` 标签并添加 \`data-lucide="图标名称"\` 属性。例如：\`<i data-lucide="home"></i>\`
   * 可以使用Tailwind类来控制图标的大小和颜色。例如：\`<i data-lucide="settings" class="w-6 h-6 text-blue-500"></i>\`
   * 提供的CDN脚本会自动将这些标签替换为SVG图标。

4. **数据可视化(智能判断)**：
   * **自主判断**：分析提供的内容，判断是否适合且有必要使用图表来可视化数据
   * **如果决定使用图表**：
     * 在\`<head>\`中添加Chart.js CDN: \`<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\`
     * 在\`<body>\`中添加一个具有唯一ID的\`<canvas>\`元素
     * 编写JavaScript代码初始化图表并应用提取的数据
   * **如果不使用图表**：则**不得**包含Chart.js CDN、canvas元素或相关JavaScript代码

5. **流程图/图示(根据内容判断)**：
   * 如果需要流程图/图示，请包含**Mermaid.js** (CDN: \`<script src="https://cdn.jsdelivr.net/npm/mermaid@11.6.0/dist/mermaid.min.js"></script>\`)
   * 提供初始化脚本和Mermaid代码

6. **动效设计**：
   * 为关键元素添加入场动画(淡入、平移等)
   * 动画时长控制在300-800ms，确保流畅不突兀
   * 遵循"少即是多"原则，避免过度动画干扰内容

## 响应式与兼容性
* **宽度响应式**: 确保卡片在不同屏幕尺寸下宽度表现良好（例如，使用 \`max-w-*\` 和 \`w-full\`）。
* **高度自适应**: 卡片高度由内容决定，不允许出现内容截断。
* 兼容Chrome, Firefox, Safari和Edge最新版本
* 针对高分辨率屏幕优化显示效果
* **内容溢出处理**: 使用CSS技巧处理潜在的内容溢出问题（特别是文本内容较长时）。

## 输出要求
* **直接输出HTML**：只返回完整的HTML代码。不要添加任何指令中未要求的解释、说明或Markdown标记。
* **完整性**：确保HTML代码包含\`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, \`<body>\`等基本结构。
* **格式规范**：确保输出的代码格式规范、缩进一致。
* 包含适当注释，便于后期编辑。
* 确保HTML代码中包含 \`\`\`html ... \`\`\` 块，并且**不要**在代码块前后添加任何额外的解释性文字。
---
## 内容
请根据以下提供的内容生成卡片：
`;