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
   * **内容换行**：**绝对不允许换行的存在**
   * **主体内容区**：展示核心要点列表、关键段落、数据可视化等
   * **层次分明**：清晰的信息层级结构，便于快速理解
   * **视觉重点**：突出核心信息和关键数据
   * **内容平衡**：文本与视觉元素的合理分配，避免过度拥挤或过于空旷
   * **空间利用**：高效利用有限空间展示信息
   * **内容完整**：确保内容完整性，不遗漏任何重要信息
   * **智能应用静态DaisyUI组件**：根据提取的信息类型，主动选用合适的 **静态展示型** DaisyUI组件进行呈现，以丰富视觉效果。例如：
     * 关键数据或统计信息，可使用 \`stats\` 组件 (e.g., \`<div class="stats shadow">...</div>\`)。
     * 重要的提示或警告信息，可使用 \`alert\` 组件 (e.g., \`<div role="alert" class="alert">...</div>\`)。
     * 用户头像或代表性图标，可使用 \`avatar\` 组件 (e.g., \`<div class="avatar">...</div>\`)。
     * 区分不同内容区块，可使用 \`divider\` 组件 (e.g., \`<div class="divider"></div>\`)。
     * 展示键盘按键或代码片段，可使用 \`kbd\` 组件 (e.g., \`<kbd class="kbd">...</kbd>\`)。
     * 显示进度或比例，可使用 \`progress\` 或 \`radial-progress\` 组件。
     * 按时间顺序展示事件，可使用 \`timeline\` 组件。
     * **请勿** 使用需要用户点击、悬停或交互才能完全展示内容的组件（如 \`collapse\`, \`dropdown\`, \`modal\`, \`tooltip\`, \`tab\` 等）。
     * （根据内容自行判断其他适用的 **静态** 组件...）

## 设计规范
* **设计风格**：采用 **${style}** 的风格。优先使用 **DaisyUI 组件类名** (例如 'card', 'btn', 'alert') 构建结构和基础布局。可以使用 Tailwind 原子类进行微调。
* **内容优先原则**：所有设计决策都应服务于内容的清晰传达。**内容是主体，设计是辅助。**
* **鼓励静态组件多样性**：在布局允许且内容合适的情况下，请尝试运用多种 **静态展示型** DaisyUI组件（如 \`alert\`, \`badge\`, \`stat\`, \`avatar\`, \`divider\`, \`kbd\`, \`progress\`, \`radial-progress\`, \`timeline\` 等）来丰富卡片的视觉层次和信息结构，避免样式过于单调。**再次强调：请勿使用需要交互的组件 (如 \`collapse\`, \`dropdown\`, \`modal\` 等)，且所有颜色必须由Tailwind类定义**。
* **布局参考 (响应式宽度，高度自适应)**：
  * **无需设置主题:** 不要 在 \`<html>\` 标签上添加 \`data-theme\` 属性。
  <html>
  <head>...</head>
  <body class="flex items-center justify-center min-h-screen font-sans p-4 bg-gray-100"> <!-- 使用 Tailwind 设置页面背景色 -->
      <div class="card w-full max-w-lg shadow-xl bg-white"> <!-- 使用 Tailwind 设置卡片背景色 -->
         <div class="card-body"> 
             <!-- 卡片内容放在这里，使用 DaisyUI 组件结构和 Tailwind 工具类 -->
             <h2 class="card-title text-gray-900">标题</h2> <!-- 使用 Tailwind 设置标题颜色 -->
             <p class="text-gray-700">内容...</p> <!-- 使用 Tailwind 设置正文颜色 -->
             <div class="divider"></div> <!-- 示例：添加静态 divider 组件 -->
             <span class="badge badge-outline border-blue-500 text-blue-500">示例标签</span> <!-- 示例：添加静态 badge，颜色用Tailwind控制 -->
             <div class="card-actions justify-end">
                 <button class="btn border-none bg-blue-600 text-white hover:bg-blue-700">按钮</button> <!-- 使用 Tailwind 设置按钮颜色和边框 -->
             </div>
         </div>
      </div>
  </body>
  </html>
* **尺寸要求**：卡片宽度建议使用 DaisyUI 布局组件或 Tailwind 最大宽度类（如 \`max-w-md\`, \`max-w-lg\`）控制，允许在小屏幕上宽度自适应（如 \`w-full\`）。**高度必须自适应**，由内容决定。
* **排版标准**：
  * 使用 DaisyUI 提供的排版或 Tailwind 类 (e.g., \`text-xl\`)。
  * **颜色**: 必须使用 **Tailwind 原子类** (e.g. \`text-gray-800\`, \`text-zinc-500\`) 定义文本颜色。
  * 行高：使用 Tailwind 类 (\`leading-relaxed\`) 确保舒适阅读。
* **色彩原则**：
  * **强制要求**：所有颜色（背景、文本、边框、强调色等）**必须**通过 **标准的 Tailwind CSS 原子类** (e.g., \`bg-indigo-500\`, \`text-slate-100\`, \`border-emerald-300\`) 实现。AI需根据 \`**${style}**\` 变量自行判断并选择合适的 Tailwind 颜色。
  * **严格禁止**：**绝对禁止**使用任何 DaisyUI 的语义化颜色类名（如 \`btn-primary\`, \`bg-base-100\`, \`text-accent\`, \`alert-info\`, \`text-primary-content\` 等等）。
  * 确保文本与背景对比度满足可读性标准。
* **背景与边框**:
  * 使用 **Tailwind 原子类** (e.g., \`bg-white\`, \`border\`, \`border-gray-200\`, \`rounded-lg\`) 定义背景颜色、边框样式和圆角。
* **样式实现**: 
  * 优先使用 **DaisyUI 组件类名** 构建HTML结构和基础布局。
  * **所有颜色相关的样式必须** 使用 **Tailwind CSS 原子类**。
  * 对于非颜色相关的细微调整（如间距、字体大小、圆角等），可以使用 Tailwind CSS 原子类。
  * **严禁**使用自定义CSS(\`<style>\`标签或\`style\`属性)来实现基础布局、颜色、字体、间距等样式。 
* **自定义CSS限制**: 自定义CSS(包括\`<style>\`标签或\`style\`属性)**只能**用于实现**动画效果**。

## 技术实现
1. **基础框架**：HTML5 + Tailwind CSS (via Browser Build) + DaisyUI (仅组件结构) + 最小化JavaScript
2. **必要CDN引入 (\`<head>\`内)**：
   * DaisyUI CSS: \`<link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
                     <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>\` (提供基础组件样式)
   * Lucide 图标: \`<script src="https://unpkg.com/lucide@latest">\` (使用方法见下文)

3. **Lucide 图标使用说明**:
   * 在HTML中插入图标，使用 \`<i>\` 标签并添加 \`data-lucide="图标名称"\` 属性。例如：\`<i data-lucide="home"></i>\`
   * 可以使用Tailwind类来控制图标的大小和颜色。例如：\`<i data-lucide="settings" class="w-6 h-6 text-blue-500"></i>\`
   * 提供的CDN脚本会自动将这些标签替换为SVG图标。
   * 在\`</body>\` 之后添加初始化脚本：\`<script>lucide.createIcons();</script>\`

4. **数据可视化(智能判断)**：
   * **自主判断**：分析提供的内容，判断是否适合且有必要使用图表来可视化数据。
   * **如果决定使用图表**：
     * 在\`<head>\`中添加Chart.js CDN: \`<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\`
     * 在\`<body>\`中添加一个具有唯一ID的\`<canvas>\`元素。
     * 编写JavaScript代码初始化图表并应用提取的数据。
   * **如果不使用图表**：则**不得**包含Chart.js CDN、canvas元素或相关JavaScript代码。

5. **流程图/图示(根据内容判断)**：
   * 如果需要流程图/图示，请包含**Mermaid.js** (CDN: \`<script src="https://cdn.jsdelivr.net/npm/mermaid@11.6.0/dist/mermaid.min.js"></script>\`)。
   * 提供初始化脚本和Mermaid代码。

6. **动效设计**：
   * 为关键元素添加入场动画(淡入、平移等)。
   * 动画时长控制在300-800ms，确保流畅不突兀。
   * 遵循"少即是多"原则，避免过度动画干扰内容。

## 响应式与兼容性
* **宽度响应式**: 确保卡片在不同屏幕尺寸下宽度表现良好（例如，使用 \`max-w-*\` 和 \`w-full\`）。
* **高度自适应**: 卡片高度由内容决定，不允许出现内容截断。
* 兼容Chrome, Firefox, Safari和Edge最新版本。
* 针对高分辨率屏幕优化显示效果。
* **内容溢出处理**: 使用CSS技巧处理潜在的内容溢出问题（特别是文本内容较长时）。

## 输出要求
* **直接输出HTML**：只返回完整的HTML代码。不要添加任何指令中未要求的解释、说明或Markdown标记。
* **完整性**：确保HTML代码包含\`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, \`<body>\`等基本结构。**不要**在 \`<html>\` 标签上添加 \`data-theme\` 属性。
* **格式规范**：确保输出的代码格式规范、缩进一致。
* 包含适当注释，便于后期编辑。
* 确保HTML代码中包含 \`\`\`html ... \`\`\` 块，并且**不要**在代码块前后添加任何额外的解释性文字。
---
## 内容
请根据以下提供的内容生成卡片：
`;