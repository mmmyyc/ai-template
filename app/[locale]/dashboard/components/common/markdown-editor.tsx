"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  RefreshCw,
  Upload,
  Pencil,
  Loader2,
  Save
} from "lucide-react"
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import 'katex/dist/katex.min.css'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu"
import { useTranslations, useLocale} from 'next-intl'; // Import the hook

// --- Define AI Style Options --- 
const aiStyleOptionsChinese = [
  { value: "Default", label: "默认", description: "默认: 通用、平衡的默认风格" },
  { value: "Concise", label: "简洁", description: "简洁: 清晰、直接、去除多余元素" },
  { value: "Professional", label: "专业", description: "专业: 正式、商务、注重结构和可信度" },
  { value: "Creative", label: "创意", description: "大胆现代风格 (Bold Modern): 采用大胆现代风格设计，打破传统排版规则，创造强烈视觉冲击。使用鲜艳对比色如荧光粉、电子蓝、亮黄等，背景可使用深色或鲜艳色块。排版应不对称且动态，标题文字极大（至少60px），可使用极粗字重或压缩字体，甚至允许文字重叠和溢出。图形元素应用几何形状，边缘锐利，可添加不规则裁切效果。层次感通过大小、颜色和位置的极端对比创造。整体设计应充满张力和活力，像一张视觉宣言，参考Wired杂志和Pentagram设计工作室的作品。添加微妙动效如悬停放大或颜色变换，增强现代感。" },
  { value: "Neobrutalism", label: "新野兽派", description: "新野兽派风格 (Neobrutalism): 一种反传统美学的现代设计趋势，特点是极端的视觉粗犷和直接表达。高饱和度、高对比度配色，如纯黑配亮黄、霓虹粉配电蓝。元素边框极明显，线条粗重（3-5px），黑色边框包围彩色块。排版采用工业感字体如Helvetica、Arial或Roboto，大小对比强烈。界面元素看起来'设计过度'，有刻意的粗糙感。阴影要么不用，要么极为夸张。可添加不规则形状、拉伸图像、不完美纹理。整体设计打破传统UI的精致感，参考Gumroad、Figma等科技品牌。" },
  { value: "Bento Grid Design", label: "便当盒", description: "便当盒: 模块化网格布局，信息块清晰" },
  { value: "Apple Design", label: "苹果设计", description: "苹果设计风格 (Apple Design): 以精致、简洁和功能性为核心的设计。大量留白创造优雅空间感，遵循严格的对齐网格和精确间距。色彩克制且协调，使用柔和色调，背景多为白色或极浅灰色。字体使用SF Pro或类似无衬线字体，元素具有一致的圆角和微妙阴影。所有交互流畅优雅，界面元素极简，使用半透明、磨砂玻璃效果和微妙层次感。强调内容优先，整体表现达到近乎完美的执行标准，参考苹果官网和iOS界面。" },
  { value: "Material Design", label: "材料设计", description: "材料设计风格 (Material Design): 谷歌开发的设计系统，基于物理世界纸张和墨水的隐喻。核心理念是创建有厚度、可移动的表面，模拟现实世界的物理特性。使用鲜明、饱和的色彩，推荐主色+强调色的配色方案。元素具有明确的层次关系，通过高度和阴影表达（使用基于光源的阴影效果）。动画基于物理运动原理，表现出加速减速的自然感。界面元素应响应触摸反馈，提供即时视觉响应。排版使用Roboto或类似无衬线字体，注重清晰的层级关系。布局基于8dp网格系统，确保在不同设备上的一致性。图标采用简化的几何形状，线条粗细统一。整体设计应表现出清晰、有序、一致的视觉语言，参考谷歌应用和Android系统界面。" },
  { value: "Flat Design", label: "扁平化", description: "扁平化设计风格 (Flat Design): 极简派设计趋势，摒弃一切装饰性元素和拟物化效果。完全移除阴影、渐变、纹理和立体感，专注于简单的二维平面表达。色彩采用大面积纯色色块，通常使用明亮、饱和的颜色，形成鲜明对比。界面元素以几何形状为基础，尤其是矩形和圆形，边缘清晰。排版强调清晰可读性，常用大号无衬线字体，文字和图标应保持极简。图标设计高度风格化和符号化，去除细节，保留本质。所有元素应表现出干净、直接、现代的视觉效果，完全依靠色彩、形状和排版创造层次感和用户引导。页面划分为明确的色块区域，创造视觉重点。整体设计应传达出清爽、高效和现代的数字美学，参考微软Metro UI和早期iOS 7的设计语言。" },
  { value: "Neumorphism", label: "新拟物", description: "新拟物风格 (Neumorphism): 结合扁平化和拟物化的现代UI设计趋势。其标志性特征是软塑形外观，元素看起来像是从背景中挤压或凹陷出来。背景和前景元素必须使用相同或非常相近的颜色，通常是柔和的浅色或暗色。通过巧妙运用双向阴影（一侧明亮，一侧黑暗）创造浅浮雕效果，光源始终一致（通常左上角）。元素边缘应使用非常微妙的圆角（8-15px）。按钮等交互元素在点击时应显示反向阴影效果（凹陷变凸起，反之亦然）。色彩应保持低对比度和柔和色调，避免鲜艳色彩。图标和文字可使用极浅的阴影或凹陷效果增强可读性。所有悬停和点击状态应微妙且流畅，不使用大幅色彩变化。整体设计应给人一种低调、精致和触感十足的印象，仿佛可以真实触摸，参考Apple的设计演变和2020年流行的用户界面趋势。" },
  { value: "Glassmorphism", label: "玻璃态", description: "玻璃态风格 (Glassmorphism): 模拟透明磨砂玻璃效果的UI设计。半透明效果，使用RGBA颜色（透明度0.5-0.8），配合背景模糊（10-20px）。元素有精细亮边框（1px白色，透明度0.2-0.4）。背景可用渐变色或简单图案，透过玻璃隐约可见。元素有轻微圆角（12-20px）。文字清晰可读，通常为浅色。光影效果模拟玻璃反光特性。布局层次分明，元素可轻微重叠强调深度。整体设计现代、轻盈、空灵，参考iOS控制中心和Windows 11。" },
  { value: "Skeuomorphism", label: "拟物化", description: "拟物化设计风格 (Skeuomorphism): 数字界面模仿现实物体外观和功能的设计方法。界面元素精确复制现实世界对应物的外观、材质和行为，包括纹理、阴影、反光和细微细节。例如，笔记应用模仿真实纸张纹理，按钮有明显的立体感和按压效果。使用丰富的纹理（皮革、金属、木纹、纸张等），通过精细渐变、高光和阴影创造立体效果。交互动画应模仿物理世界行为，如页面翻动、按钮弹回和开关切换。配色应遵循现实物体的实际颜色，避免不自然的色彩。图标设计高度详细，包含所有现实对应物的视觉特征。整体界面应给用户一种熟悉感和直观理解，仿佛在操作实体物品，参考早期iOS（iOS 6之前）和苹果的Cover Flow音乐浏览器。" },
  { value: "Minimalism", label: "极简主义", description: "极简主义风格 (Minimalist): 采用极简主义风格设计，遵循'少即是多'的理念。使用大量留白创造呼吸空间，仅保留最必要的元素。配色方案限制在2-3种中性色，主要为白色背景配以黑色或深灰色文字。排版应精确到像素级别，使用精心设计的网格系统和黄金比例。字体选择无衬线字体如Helvetica或Noto Sans，字重变化作为主要层次手段。装饰元素几乎为零，仅使用极细的分隔线和微妙的阴影。整体设计应呈现出克制、优雅且永恒的美学，让内容本身成为焦点。参考Dieter Rams的设计原则和日本无印良品(MUJI)的产品美学。" },
  { value: "Retro/Vintage", label: "复古", description: "优雅复古风格 (Elegant Vintage): 采用优雅复古风格设计，重现20世纪初期印刷品的精致美学。使用米色或淡黄色纸张质感背景，配以深棕、暗红等老式印刷色。字体必须使用衬线字体如Baskerville或Noto Serif，标题可使用装饰性字体。排版应对称且庄重，遵循传统书籍设计原则。装饰元素包括精致的花纹边框、古典分隔线和角落装饰，可添加轻微做旧效果如纸张纹理和微妙污点。图像应用复古滤镜处理，呈现褪色照片效果。整体设计应散发出典雅、成熟且历经时间考验的气质，参考The New Yorker和老式法国时尚杂志的设计语言。" },
  { value: "Cyberpunk", label: "赛博朋克", description: "赛博朋克风格 (Cyberpunk): 融合高科技与低生活的反乌托邦美学。霓虹色调与深色背景对比，常用霓虹粉、亮紫、电子蓝和酸性黄。使用未来感字体如Blade Runner或Orbitron，可添加故障效果。包含技术网格线、全息效果、数字噪点、扫描线。界面可模拟CRT显示器效果。使用霓虹发光效果，元素看起来'被黑客入侵'或'故障中'。图像高对比度、色彩分离和噪点。布局可不对称或系统性杂乱。整体呈现未来感和不安氛围，参考《银翼杀手》和《赛博朋克2077》。" },
  { value: "Memphis Design", label: "孟菲斯", description: "孟菲斯设计风格 (Memphis Design): 源于1980年代的后现代设计运动，以其大胆、不拘一格和充满活力的视觉特点著称。使用鲜艳、不协调的颜色组合，如荧光粉、翠绿、明黄和靛蓝，打破传统色彩理论。图形元素采用几何形状（圆点、波浪线、锯齿形和之字形）自由组合，刻意违反常规设计规则。图案应看起来随意而混乱，但实际经过精心编排。排版可使用多种字体混搭，甚至在单个句子中变换字体。背景和装饰可包含抽象的网格、条纹和不规则碎片。界面元素（按钮、菜单、分割线）应采用不规则形状和夸张边框。整体设计应表现出充满趣味性、反叛精神和对传统的挑战，给人一种刻意的复古未来感，参考80年代的流行文化和当代品牌如Saved by the Bell的视觉风格。" },
  { value: "Bauhaus", label: "包豪斯", description: "包豪斯设计风格 (Bauhaus): 源于20世纪早期德国设计学校的极简主义美学。核心理念是'形式服从功能'，强调简洁、实用和几何精确。色彩限制在基本原色（红、黄、蓝）加黑白，使用大块纯色区域，不使用渐变。形状以基本几何图形为主（正方形、长方形、圆形、三角形），排列整齐有序。网格系统严格，基于模块化原则和数学比例。排版使用无衬线字体，通常全部大写或小写，避免装饰。布局强调水平和垂直线条，创造平衡与和谐。图形元素简化到最基本形式，去除所有非必要细节。交互设计应清晰明确，没有多余动效。整体设计应传达出理性、结构化和工业精神，同时保持视觉平衡与和谐，参考早期现代主义设计和当代德国工业设计。" },
  { value: "Brutalism", label: "野兽派", description: "野兽派设计风格 (Brutalism): 源于建筑领域的原始、未经修饰的美学风格，应用于数字界面。特点是故意违反传统设计规则，展现原始和未完成的外观。使用不加修饰的HTML元素，基本的CSS样式和系统默认字体（如Courier或Times New Roman）。布局刻意不平衡，使用不规则网格或完全没有明显网格。排版混合各种大小、粗细和对齐方式，常使用过大或过小的字号制造冲突感。色彩可能使用刺眼的组合或完全单色（如黑白），避免渐变和柔和过渡。界面元素（按钮、表单）保持最基本外观，几乎没有装饰。图像可能使用低分辨率、像素化处理或故意扭曲变形。可使用裸露的结构元素，如显示代码注释、网格线或开发标记。整体设计应给人一种原始、不妥协和反商业的数字朋克感，参考早期网络美学和当代艺术网站。" },
  { value: "Y2K Aesthetic", label: "千禧年", description: "千禧年风格 (Y2K Aesthetic): 重现2000年前后互联网早期和数字文化的视觉风格。融合科技乐观主义和数字化未来的想象。使用亮丽的金属色调（银色、铬合金、全息效果）和鲜艳糖果色（淡蓝、粉红、紫色），经常采用渐变和光泽效果。字体选择未来主义和技术感十足的样式，如Eurostile或OCR-A，通常带有金属质感或立体效果。图形元素包括全息图、金属纹理、像素化图案、二进制码和早期3D渲染。界面元素设计成圆润的塑料或金属外观，如气泡按钮或水滴形状。背景可使用格子纹、虚线网格或简单的3D空间表现。装饰元素包括星形、光芒、小行星和赛博空间符号。图像处理应用蓝色色调滤镜或高对比度效果。整体设计应唤起对早期数字时代的怀旧感和对技术的乐观态度，参考早期Windows界面、电子游戏和音乐视频的美学。" },
  { value: "Vaporwave", label: "蒸汽波", description: "蒸汽波风格 (Vaporwave): 互联网亚文化美学，结合了80-90年代复古元素与超现实主义。色彩以霓虹粉、青蓝、紫色为主，形成梦幻般的渐变和柔和色调，营造怀旧氛围。必须包含标志性视觉元素：罗马雕塑、古典建筑柱、棕榈树、格子地板和早期计算机界面元素。排版使用全角日文片假名与英文混搭，通常使用Times New Roman或Arial等经典字体，字间距夸张拉伸。背景常使用低分辨率的天空、海洋或渐变色，搭配格子或网格纹理。图像应故意降低质量，添加噪点、扫描线、VHS效果或故障艺术风格。界面元素可模仿早期Windows 95/98的设计元素，如窗口、按钮和图标。可加入日本流行文化元素、复古电子产品图像和早期互联网符号。整体设计应呈现出怀旧、超现实和轻微荒诞的美学，传达数字时代的孤独感和消费主义批判，参考艺术家如Macintosh Plus的视觉风格。" },
  { value: "Corporate Memphis", label: "企业孟菲斯", description: "企业孟菲斯风格 (Corporate Memphis): 当代科技公司广泛采用的简化插画风格，又称'大型科技扁平风'。特点是使用简化、几何化的人物形象，通常具有不成比例的肢体（细长的四肢、小头部）和缺乏细节的脸部表情。色彩采用柔和、明亮的色调，避免阴影和立体感，常用蓝紫色、粉色、黄色等科技公司配色。图形元素高度风格化，使用简单的几何形状和基本线条，完全避免复杂纹理。插图场景通常表现多元化人物在愉快协作或使用科技产品。背景简洁或完全留白，专注于人物和对象。可添加简单装饰如波浪线、圆点或抽象形状增加视觉趣味。所有视觉元素都应保持一致的简化程度，避免过度细节。整体设计应传达友好、包容和积极的情绪，同时保持中性和商业化的观感，参考Facebook、Airbnb和其他科技公司的品牌插画。" },
  { value: "Dark Mode", label: "暗黑模式", description: "暗黑模式设计 (Dark Mode): 为低光环境优化的界面设计。背景使用深色但避免纯黑（推荐#121212或#1e1e1e）。文本使用浅色但避免纯白（建议#e0e0e0）。强调色应更饱和鲜艳（比标准亮15-20%）。UI元素用不同深度灰色创建层次。谨慎使用阴影，多依靠细微边框或深度变化区分元素。图标和插图简化以确保清晰。交互状态使用色相变化而非仅亮度变化。参考现代操作系统和应用的暗色模式。" },
  { value: "Claymorphism", label: "粘土态", description: "粘土态设计风格 (Claymorphism): 近期兴起的UI设计趋势，模拟柔软粘土或橡皮泥质感。核心特征是创造看似柔软、可挤压的界面元素，给人一种触感丰富、可交互的印象。元素应有明显的圆角（至少20px，甚至完全圆形），表面看起来松软饱满。阴影效果独特，需同时使用内阴影和外阴影：外阴影（较大模糊值，10-15px）创造浮动效果，内阴影（较小模糊值，3-5px）增强软度感。配色通常采用柔和的糖果色调，如粉红、淡蓝、薄荷绿、淡紫，背景色应比元素稍深，增强深度对比。所有交互元素在悬停和点击时应表现出被按压的效果，轻微缩小并增加内阴影。可添加轻微的纹理或噪点增强材质感。排版应使用圆润友好的字体，如Comic Sans或Fredoka。整体设计应给人一种友好、可触摸、有童趣的感觉，参考玩具设计和当代插画风格。" },
  { value: "Swiss/International Style", label: "瑞士国际风格", description: "瑞士国际风格 (Swiss/International Style): 源于20世纪中期瑞士平面设计的极简主义美学。核心理念是追求清晰、客观和功能性的视觉传达。设计基于严格的网格系统，所有元素精确对齐，创造井然有序的结构。排版是关键元素，几乎完全依赖无衬线字体（如Helvetica、Univers），通常使用左对齐和非对称布局。色彩克制，主要使用黑白对比，偶尔添加一种原色作为强调。图像应客观、直接，避免装饰性或情感化处理。大量运用负空间（留白），确保内容有充分'呼吸空间'。层次结构通过字体大小、粗细和间距变化建立，而非使用装饰线或边框。界面元素简洁到极致，去除所有非必要视觉元素。可适当使用照片，但应以客观记录方式呈现。整体设计应散发出理性、秩序感和永恒质量，注重信息的清晰传达而非风格表现，参考现代企业VI设计和博物馆展示设计。" },
  { value: "Atomic Design", label: "原子设计", description: "原子设计系统 (Atomic Design): 一种模块化设计方法论，基于化学元素组合的概念构建界面。将设计元素分为五个层级：原子（最基本UI元素如按钮、输入框）、分子（由多个原子组合的简单组件）、有机体（功能完整的组件）、模板（页面布局框架）和页面（最终用户界面）。设计过程从简单到复杂，确保组件可重用且保持一致性。每个组件都应有明确文档说明其用途、变体和使用场景。颜色、字体、间距等基础变量应统一定义并在系统中一致应用。组件应响应式设计，在各种屏幕尺寸下保持功能和美观。界面更新时，只需修改相关组件即可全局应用变更。设计团队和开发团队使用统一语言和组件库，提高协作效率。整体设计系统应保持灵活性和可扩展性，同时确保品牌一致性，参考Material Design系统和大型企业设计系统。" },
  { value: "Monochrome", label: "单色", description: "单色设计风格 (Monochrome): 使用单一颜色的不同色调、饱和度和亮度值创造的视觉美学。选择一种主色（如蓝色、紫色或灰色），然后使用该颜色的10-15种不同变体，从最浅到最深，创建丰富的色彩层次。背景通常使用最浅的色调（接近白色），主要内容区域使用中等色调，而强调和交互元素使用最深最饱和的色调。对比主要通过亮度变化而非色相差异创造，形成微妙优雅的视觉层次。可添加极少量的纯黑或纯白作为点缀，增强对比。图像可考虑使用该色调的滤镜处理，与整体配色方案融合。排版格式应特别注重尺寸、粗细和间距变化，弥补色彩变化有限的局限。图形元素应简洁，避免复杂图案干扰单色的纯净感。整体设计应传达出专注、和谐和精致的感觉，适合表达现代简约和高级感，参考奢侈品品牌和现代艺术网站的设计语言。" },
  { value: "Isometric", label: "等距", description: "等距设计风格 (Isometric): 一种2.5D表现技术，使用特定的30度角投影创造三维物体的幻觉，而不使用透视效果。所有垂直线保持垂直，而水平线则以30度角向左右倾斜，创造统一的深度表现。物体的三个可见面（顶部、左侧、右侧）应使用同一物体颜色的三种不同深浅，通常右侧最亮，左侧居中，顶部最深，模拟一致的光源。所有元素都应遵循相同的等距网格，确保一致性。不使用透视变形，所有平行线保持平行，无论距离远近。图标和插图应特别设计成等距视角，常见于表现建筑、城市场景、产品展示和数据可视化。界面元素可分层叠放，创造深度感。色彩应鲜明且区分度高，帮助区分不同平面和组件。整体设计应给人一种整洁、技术感和精准的印象，平衡2D简洁性和3D空间感，参考游戏界面和建筑设计图。" },
  { value: "Gradient", label: "渐变", description: "渐变设计风格 (Gradient): 运用色彩平滑过渡创造的现代视觉表现。渐变可采用多种形式：线性（从一点到另一点）、径向（从中心向外扩散）、圆锥形或网格渐变。色彩过渡应流畅自然，通常使用2-4种互补或类似色，如紫色过渡到粉红再到橙色。背景常用大面积柔和渐变，创造空间感和深度。UI元素如按钮和卡片可使用微妙渐变增强立体感，渐变方向应保持一致（如从左上到右下）。文字在渐变背景上要确保可读性，可添加半透明背景层或阴影。亮度对比应细致调整，确保无障碍性。渐变可结合磨砂玻璃效果增强现代感。交互元素在悬停和点击时可通过渐变变化提供视觉反馈。整体设计应呈现出流动、现代和动态的视觉效果，避免过度使用导致视觉疲劳，参考Apple的iOS背景和现代网站的设计趋势。" },
  { value: "Animated UI", label: "动画界面", description: "动画界面设计 (Animated UI): 通过精心设计的动效增强用户体验和界面交互的设计方法。所有动画应有明确目的，如指示状态变化、引导注意力或提供反馈，避免纯装饰性动画。动效应遵循自然运动原理，使用恰当的加速度和减速度曲线（如ease-in-out），模拟物理世界的运动感。时长控制在适当范围：微交互150-300ms，内容转换300-500ms，避免过长动画导致用户等待。状态转换（悬停、点击、加载）应有一致的动画语言。页面元素入场可采用错时动画，如内容块依次淡入。重要信息可使用循环动画（如脉冲、呼吸效果）吸引注意。导航和页面切换动画应提供空间方向感，帮助用户理解信息架构。可使用细微的背景动效（如渐变流动、粒子效果）增加活力。应考虑性能优化和用户可关闭动画的选项。整体动效设计应克制且有目的性，增强而非干扰用户体验，参考iOS和Android的动效设计准则。" },
  { value: "3D Design", label: "三维", description: "三维设计风格 (3D Design): 将立体三维元素融入平面界面的视觉设计方法。使用真实的光影效果、纹理和深度创造沉浸感和空间感。3D元素可包括立体图标、产品展示、场景插图或抽象装饰物。光源设置至关重要，应保持一致性，通常来自左上方，创造自然阴影和高光。材质表现多样化，可模拟金属、玻璃、塑料或布料等，需注重反光和透明度的真实表现。可使用环境光遮蔽(AO)增强深度感。界面中的3D元素应支持交互，如旋转、缩放或展开。色彩应考虑光线影响，而非纯平面色彩。3D元素不应过度复杂，保持与整体界面的视觉平衡。可结合动效创造更生动的体验，如3D元素随滚动变换视角。应注意性能优化，特别是在移动设备上。整体设计应给用户带来新鲜感和惊喜，同时保持功能性和可用性，参考高端产品网站和创意机构作品集。" },
  { value: "Handcrafted/Doodle", label: "手绘", description: "手绘风格 (Handcrafted/Doodle): 模仿手工绘制的设计风格，强调人性化触感和不完美的自然美学。图形元素应看起来像用铅笔、钢笔、水彩或蜡笔手工创作，保留笔触纹理和轻微不规则性。线条应有变化的粗细和不完全的连接，模拟真实绘画的自然感。色彩可略显不均匀，像是手工上色，使用略微错位的填充。字体选择手写风格如Comic Sans、Indie Flower或自定义手写字体，避免过于完美的排版。背景可使用纸张纹理、轻微褶皱或污点效果增强真实感。装饰元素包括随性涂鸦、箭头、圈点和手绘边框。图标和按钮设计成手绘形式，避免完美几何形状。页面布局可以稍微不对称，像是在笔记本上随性安排。整体设计应传达出亲切、创意和个性化的感觉，适合儿童内容、创意项目和希望表达独特个性的品牌，参考创意博客和手工艺品网站的视觉风格。" },
  { value: "Micro-interactions", label: "微交互", description: "微交互: 小型动画反馈，提升交互感" },
  { value: "Asymmetrical Layouts", label: "不对称布局", description: "不对称布局: 打破平衡，创造视觉动感" },
  { value: "Organic Design", label: "有机设计", description: "有机设计: 模仿自然形态和曲线" },
];

const aiStyleOptionsEnglish = [
  { value: "Default", label: "Default", description: "Default: General, balanced default style" },
  { value: "Concise", label: "Concise", description: "Concise: Clear, direct, removes redundant elements" },
  { value: "Professional", label: "Professional", description: "Professional: Formal, business-oriented, focuses on structure and credibility" },
  { value: "Creative", label: "Creative", description: "Bold Modern: Uses a bold modern design style, breaking traditional typography rules to create strong visual impact. Uses vibrant contrasting colors like fluorescent pink, electric blue, bright yellow, etc. Backgrounds can be dark or use vibrant color blocks. Typography should be asymmetrical and dynamic, with extremely large headline text (at least 60px), using very bold weights or condensed fonts, even allowing text overlap and overflow. Graphic elements use geometric shapes with sharp edges, possibly adding irregular cropping effects. Hierarchy is created through extreme contrasts in size, color, and position. The overall design should be full of tension and vitality, like a visual manifesto, referencing Wired magazine and Pentagram design studio work. Subtle animations like hover scaling or color changes enhance the modern feel." },
  { value: "Neobrutalism", label: "Neobrutalism", description: "Neobrutalism: A design trend rejecting traditional aesthetics for raw expression. Uses high-saturation, high-contrast colors like black with bright yellow. Elements have prominent borders (3-5px). Typography uses industrial fonts with dramatic size contrasts. Interface elements appear deliberately 'over-designed' with intentional roughness. Shadows are either absent or exaggerated. May include irregular shapes and imperfect textures. Interactive elements have obvious state changes. References cutting-edge tech brands like Gumroad and Figma." },
  { value: "Bento Grid Design", label: "Bento Grid", description: "Bento Grid: Modular grid layout, clear information blocks" },
  { value: "Apple Design", label: "Apple Design", description: "Apple Design: A design centered on refinement and simplicity. Uses whitespace with strict alignment grids and precise spacing. Colors are restrained with backgrounds primarily white or light gray. Typography uses SF Pro or similar sans-serif fonts. Visual elements have consistent corner radii (8-12px) and subtle realistic shadows. Interactions are smooth with refined transitions. Interface elements are minimal with translucency and subtle layering. Content takes priority. Overall execution meets near-perfect standards, referencing Apple's website and iOS designs." },
  { value: "Material Design", label: "Material Design", description: "Material Design: A design system developed by Google based on the metaphor of paper and ink. Core concept creates surfaces with thickness and movement, simulating real-world physics. Uses bold, saturated colors with primary and accent color schemes. Elements have clear hierarchy expressed through elevation and shadows (using light-source based shadow effects). Animations follow physical motion principles with natural acceleration/deceleration. Interface elements respond to touch with immediate visual feedback. Typography uses Roboto or similar sans-serif fonts with clear hierarchical relationships. Layout based on 8dp grid system ensuring consistency across devices. Icons use simplified geometric shapes with uniform stroke weights. The overall design expresses a clear, ordered and consistent visual language referencing Google applications and Android interfaces." },
  { value: "Flat Design", label: "Flat Design", description: "Flat Design: A minimalist design trend that eliminates all decorative elements and skeuomorphism. Completely removes shadows, gradients, textures and dimensionality, focusing on simple 2D plane expression. Uses large areas of solid colors, typically bright and saturated hues creating stark contrasts. Interface elements are based on geometric shapes, especially rectangles and circles with crisp edges. Typography emphasizes clear readability with large sans-serif fonts, keeping text and icons minimal. Icons are highly stylized and symbolic, removing details while retaining essence. All elements express clean, direct, modern visual effects, relying solely on color, shape, and typography to create hierarchy and user guidance. Pages are divided into clear color block areas creating visual focus. The overall design conveys a fresh, efficient and modern digital aesthetic, referencing Microsoft's Metro UI and early iOS 7 design language." },
  { value: "Neumorphism", label: "Neumorphism", description: "Neumorphism: A modern UI design trend combining flat design and skeuomorphism. Characterized by soft plastic appearance where elements look extruded from or pressed into the background. Background and foreground elements must use identical or very similar colors, typically soft light or dark tones. Creates subtle bas-relief effect through clever use of dual shadows (light on one side, dark on the other) with consistent light source (typically upper-left). Element edges use very subtle rounded corners (8-15px). Interactive elements like buttons display inverse shadow effect when clicked (concave becomes convex and vice versa). Colors maintain low contrast and soft tones, avoiding vibrant hues. Icons and text may use very slight shadows or indentations for readability. All hover and click states are subtle and fluid, avoiding major color changes. The overall design gives an understated, refined and tactile impression, as if physically touchable, referencing Apple's design evolution and 2020 UI trends." },
  { value: "Glassmorphism", label: "Glassmorphism", description: "Glassmorphism: Simulates frosted glass effects with translucency (RGBA colors, opacity 0.5-0.8) and background blur (10-20px). Elements have fine light borders (1px white, opacity 0.2-0.4) and slight rounded corners (12-20px). Text is typically light-colored against darker backgrounds. Lighting simulates glass reflections. Layouts have clear hierarchy with slight element overlapping for depth. The design is modern and lightweight, referencing iOS Control Center and Windows 11." },
  { value: "Skeuomorphism", label: "Skeuomorphism", description: "Skeuomorphism: A design approach where digital interfaces mimic real-world objects' appearance and function. Interface elements precisely replicate the appearance, materials, and behavior of their real-world counterparts, including textures, shadows, reflections, and minute details. Examples include note-taking apps mimicking real paper textures, buttons with obvious dimensionality and press effects. Uses rich textures (leather, metal, wood grain, paper), creating dimensional effects through detailed gradients, highlights, and shadows. Interaction animations mimic physical world behaviors like page flipping, button springs, and switch toggles. Colors follow actual colors of real objects, avoiding unnatural palettes. Icon designs are highly detailed, including all visual characteristics of their real-world counterparts. The overall interface gives users a sense of familiarity and intuitive understanding, as if operating physical items, referencing early iOS (pre-iOS 6) and Apple's Cover Flow music browser." },
  { value: "Minimalism", label: "Minimalism", description: "Minimalist: Adopts a minimalist design style following the 'less is more' philosophy. Uses ample white space to create breathing room, retaining only the most necessary elements. The color palette is limited to 2-3 neutral colors, primarily a white background with black or dark gray text. Typography should be pixel-perfect, using a meticulously designed grid system and golden ratio. Choose sans-serif fonts like Helvetica or Noto Sans, using font weight variations as the primary means of hierarchy. Decorative elements are almost zero, using only very thin dividing lines and subtle shadows. The overall design should present a restrained, elegant, and timeless aesthetic, letting the content itself be the focus. References Dieter Rams' design principles and MUJI's product aesthetics." },
  { value: "Retro/Vintage", label: "Retro/Vintage", description: "Elegant Vintage: Adopts an elegant vintage design style, recreating the exquisite aesthetics of early 20th-century print. Uses beige or pale yellow paper texture backgrounds, paired with dark brown, deep red, and other old-style printing colors. Must use serif fonts like Baskerville or Noto Serif; decorative fonts can be used for titles. Typography should be symmetrical and dignified, following traditional book design principles. Decorative elements include delicate patterned borders, classic dividing lines, and corner ornaments, with optional light aging effects like paper texture and subtle stains. Images should be processed with vintage filters to present a faded photo effect. The overall design should exude elegance, maturity, and a time-tested quality, referencing the design language of The New Yorker and old French fashion magazines." },
  { value: "Cyberpunk", label: "Cyberpunk", description: "Cyberpunk: A dystopian aesthetic blending high technology with low living. Uses neon colors against dark backgrounds - pink, purple, blue, and acid yellow on black/deep blue. Typography uses futuristic fonts like Blade Runner with potential glitch effects. Includes grid lines, holographic effects, digital noise, and scan lines. May simulate CRT displays with halos and chromatic aberration. Elements appear 'hacked' or 'glitching.' Images use high contrast and noise. Layouts can be asymmetrical yet systematic. References 'Blade Runner' and 1980s future imaginings." },
  { value: "Memphis Design", label: "Memphis", description: "Memphis Design: A postmodern design movement from the 1980s known for bold, eclectic, and energetic visual characteristics. Uses bright, discordant color combinations like fluorescent pink, teal, bright yellow, and indigo, breaking traditional color theory. Graphic elements combine geometric shapes (dots, squiggles, zigzags, jagged forms) freely, deliberately violating conventional design rules. Patterns appear random and chaotic but are carefully orchestrated. Typography may mix multiple fonts, even changing within a single sentence. Backgrounds and decorations can include abstract grids, stripes, and irregular fragments. Interface elements (buttons, menus, dividers) use irregular shapes and exaggerated borders. The overall design expresses playfulness, rebellion, and challenge to tradition, giving a deliberate retro-futuristic feel, referencing 80s pop culture and contemporary brands like Saved by the Bell." },
  { value: "Bauhaus", label: "Bauhaus", description: "Bauhaus: A minimalist aesthetic from early 20th century German design school emphasizing 'form follows function.' Uses limited palette of primary colors (red, yellow, blue) plus black and white, with large blocks of solid color and no gradients. Shapes focus on basic geometry (squares, rectangles, circles, triangles) arranged in orderly compositions. Strict grid systems based on modular principles and mathematical proportions. Typography uses sans-serif fonts, often all uppercase or lowercase, avoiding decoration. Layouts emphasize horizontal and vertical lines, creating balance and harmony. Graphic elements are reduced to their most essential form with all non-essential details removed. Interaction design should be clear and straightforward without excessive animation. The overall design conveys rationality, structure, and industrial spirit while maintaining visual balance and harmony, referencing early modernist design and contemporary German industrial design." },
  { value: "Brutalism", label: "Brutalism", description: "Brutalism: A raw, unpolished aesthetic from architecture applied to digital interfaces. Deliberately violates traditional design rules to show primitive and unfinished appearance. Uses unstyled HTML elements, basic CSS, and system default fonts like Courier or Times New Roman. Layouts are intentionally unbalanced with irregular or no obvious grids. Typography mixes various sizes, weights, and alignments, often using extremely large or small font sizes to create conflict. Colors may use jarring combinations or complete monochrome (black and white), avoiding gradients and soft transitions. Interface elements (buttons, forms) maintain basic appearance with minimal decoration. Images may use low resolution, pixelation, or intentional distortion. May expose structural elements like code comments, grid lines, or development markers. The overall design gives a raw, uncompromising, anti-commercial digital punk feeling, referencing early web aesthetics and contemporary art websites." },
  { value: "Y2K Aesthetic", label: "Y2K Aesthetic", description: "Y2K Aesthetic: Recreates the visual style of early internet and digital culture around the year 2000. Combines tech optimism with imagined digital futures. Uses bright metallic tones (silver, chrome, holographic effects) and vibrant candy colors (baby blue, pink, purple) with gradients and glossy effects. Fonts choose futuristic and tech-focused styles like Eurostile or OCR-A, often with metallic textures or dimensional effects. Graphic elements include holograms, metallic textures, pixelated patterns, binary code, and early 3D rendering. Interface elements designed with rounded plastic or metallic appearances like bubble buttons or droplet shapes. Backgrounds may use grids, dotted lines, or simple 3D space representations. Decorative elements include stars, light bursts, asterisks, and cyberspace symbols. Image processing applies blue-tint filters or high-contrast effects. The overall design evokes nostalgia for early digital era and optimism about technology, referencing early Windows interfaces, video games, and music videos." },
  { value: "Vaporwave", label: "Vaporwave", description: "Vaporwave: An internet subculture aesthetic combining 80s-90s retro elements with surrealism. Colors focus on neon pink, cyan-blue, and purple creating dreamy gradients and soft hues for nostalgic atmosphere. Must include iconic visual elements: Roman sculptures, classical columns, palm trees, checkerboard floors, and early computer interface elements. Typography combines full-width Japanese katakana with English, typically using Times New Roman or Arial with exaggerated letter spacing. Backgrounds often use low-resolution skies, oceans, or gradients with grid or checkerboard textures. Images should be deliberately downgraded with noise, scanlines, VHS effects, or glitch art styles. Interface elements may mimic early Windows 95/98 design components like windows, buttons, and icons. May incorporate Japanese pop culture elements, vintage electronics images, and early internet symbols. The overall design presents a nostalgic, surreal and slightly absurd aesthetic, conveying digital-age loneliness and criticism of consumerism, referencing artists like Macintosh Plus." },
  { value: "Corporate Memphis", label: "Corporate Memphis", description: "Corporate Memphis: A simplified illustration style widely adopted by tech companies, also called 'Big Tech Flat'. Features simplified, geometric human figures typically with disproportionate limbs (thin elongated arms/legs, small heads) and minimal facial details. Colors use soft, bright tones avoiding shadows and dimensionality, commonly using blue-purple, pink, yellow and other tech company palettes. Graphic elements are highly stylized using simple geometric shapes and basic lines, completely avoiding complex textures. Illustrated scenarios typically show diverse people happily collaborating or using tech products. Backgrounds are simple or completely white, focusing on characters and objects. May add simple decorations like wavy lines, dots, or abstract shapes for visual interest. All visual elements maintain consistent simplification level, avoiding excessive detail. The overall design conveys friendly, inclusive, and positive emotions while maintaining a neutral and commercialized look, referencing Facebook, Airbnb, and other tech companies' brand illustrations." },
  { value: "Dark Mode", label: "Dark Mode", description: "Dark Mode: Optimized for low-light environments. Backgrounds use dark tones, avoiding pure black (recommend #121212). Text uses light colors but avoids pure white (suggest #e0e0e0). Accent colors are more saturated (15-20% brighter than standard). UI elements use varying depths of gray for hierarchy. Shadows are minimal, using subtle borders or depth changes. Icons are simplified for clarity. Interactive states use hue changes rather than just brightness variations. References modern OS and application dark modes." },
  { value: "Claymorphism", label: "Claymorphism", description: "Claymorphism: A recent UI design trend simulating soft clay or plasticine textures. Core characteristics create interface elements that appear soft and squeezable, giving a tactile, interactive impression. Elements have pronounced rounded corners (at least 20px or completely rounded) with surfaces appearing plump and soft. Shadow effects are distinctive, using both outer and inner shadows: outer shadows (larger blur values, 10-15px) create floating effect, while inner shadows (smaller blur values, 3-5px) enhance softness. Colors typically use soft candy tones like pink, baby blue, mint green, and lavender, with backgrounds slightly darker than elements to enhance depth contrast. All interactive elements express a pressed effect when hovered and clicked, slightly shrinking with increased inner shadow. May add subtle texture or noise for material feel. Typography uses rounded friendly fonts like Comic Sans or Fredoka. The overall design gives a friendly, touchable, playful feeling, referencing toy design and contemporary illustration styles." },
  { value: "Swiss/International Style", label: "Swiss/International", description: "Swiss/International Style: A minimalist aesthetic from mid-20th century Swiss graphic design seeking clear, objective, functional visual communication. Based on strict grid systems with all elements precisely aligned, creating ordered structure. Typography is key, relying almost exclusively on sans-serif fonts (like Helvetica, Univers), typically left-aligned with asymmetrical layouts. Colors are restrained, primarily using black and white contrast with occasional primary color for emphasis. Images should be objective and direct, avoiding decorative or emotional treatment. Extensive use of negative space ensures content has room to 'breathe'. Hierarchy established through font size, weight and spacing variations rather than decorative lines or borders. Interface elements are reduced to utmost simplicity, removing all non-essential visual elements. May use photography but presented in objective documentary style. The overall design expresses rationality, order and timeless quality, prioritizing clear information transmission over stylistic expression, referencing modern corporate visual identities and museum exhibition design." },
  { value: "Atomic Design", label: "Atomic Design", description: "Atomic Design: A modular design methodology based on the concept of chemical elements combining to build interfaces. Divides design elements into five levels: atoms (basic UI elements like buttons, inputs), molecules (simple components combining multiple atoms), organisms (complete functional components), templates (page layout frameworks), and pages (final user interfaces). Design process moves from simple to complex, ensuring components are reusable and consistent. Each component should have clear documentation explaining its purpose, variations, and usage scenarios. Basic variables like colors, fonts, and spacing should be uniformly defined and consistently applied throughout the system. Components should be responsive, maintaining functionality and aesthetics across screen sizes. When interfaces are updated, changes to components are applied globally. Design and development teams use unified language and component libraries, improving collaboration efficiency. The overall design system should maintain flexibility and scalability while ensuring brand consistency, referencing Material Design and enterprise design systems." },
  { value: "Monochrome", label: "Monochrome", description: "Monochrome: A visual aesthetic created using different shades, saturations, and brightness values of a single color. Selects one primary color (such as blue, purple, or gray) and uses 10-15 different variations from lightest to darkest to create rich color hierarchy. Backgrounds typically use the lightest tones (approaching white), main content areas use medium tones, while emphasis and interactive elements use the deepest, most saturated tones. Contrast is created primarily through brightness variations rather than hue differences, forming subtle, elegant visual hierarchy. May add minimal amounts of pure black or white as accents to enhance contrast. Images may be treated with filters in the chosen hue to blend with the overall color scheme. Typography format should especially focus on size, weight, and spacing variations to compensate for limited color variation. Graphic elements should be clean, avoiding complex patterns that might disrupt the monochrome purity. The overall design should convey focus, harmony, and sophistication, suitable for expressing modern minimalism and premium feel, referencing luxury brands and modern art websites." },
  { value: "Isometric", label: "Isometric", description: "Isometric: A 2.5D representation technique using a specific 30-degree angle projection to create the illusion of three-dimensional objects without using perspective. All vertical lines remain vertical while horizontal lines slant at 30 degrees to the left and right, creating a unified depth representation. The three visible faces of objects (top, left, right) should use three different shades of the same object color, typically with the right side lightest, left side medium, and top darkest, simulating consistent light source. All elements should follow the same isometric grid for consistency. No perspective distortion is used, with all parallel lines remaining parallel regardless of distance. Icons and illustrations should be specially designed in isometric view, common for representing architecture, urban scenes, product displays, and data visualization. Interface elements can be layered for depth. Colors should be vibrant with high distinction to help differentiate planes and components. The overall design should give an impression of neatness, technicality, and precision, balancing 2D simplicity with 3D spatial feeling, referencing game interfaces and architectural designs." },
  { value: "Gradient", label: "Gradient", description: "Gradient: A modern visual expression using smooth color transitions. Gradients can take multiple forms: linear (point to point), radial (expanding from center), conic, or mesh gradients. Color transitions should be smooth and natural, typically using 2-4 complementary or analogous colors such as purple transitioning to pink to orange. Backgrounds often use large, soft gradients creating sense of space and depth. UI elements like buttons and cards can use subtle gradients for dimensionality, with gradient direction remaining consistent (such as top-left to bottom-right). Text on gradient backgrounds must ensure readability, possibly adding semi-transparent background layers or shadows. Brightness contrast should be carefully adjusted for accessibility. Gradients can be combined with frosted glass effects for modern feel. Interactive elements can provide visual feedback through gradient changes on hover and click. The overall design should present flowing, modern and dynamic visual effects, avoiding overuse that could cause visual fatigue, referencing Apple's iOS backgrounds and modern website design trends." },
  { value: "Animated UI", label: "Animated UI", description: "Animated UI: A design approach enhancing user experience and interface interactions through carefully designed motion. All animations should have clear purpose, such as indicating state changes, directing attention, or providing feedback, avoiding purely decorative animations. Motion should follow natural movement principles using appropriate acceleration and deceleration curves (like ease-in-out) to simulate physical world movement. Duration should be kept within appropriate ranges: 150-300ms for micro-interactions, 300-500ms for content transitions, avoiding overly long animations that cause user waiting. State transitions (hover, click, loading) should have consistent animation language. Page elements can enter using staggered animations, such as content blocks fading in sequence. Important information can use looping animations (like pulses or breathing effects) to attract attention. Navigation and page transition animations should provide spatial direction, helping users understand information architecture. Subtle background animations (like gradient flows or particle effects) can add vitality. Performance optimization and user options to disable animations should be considered. The overall motion design should be restrained and purposeful, enhancing rather than distracting from user experience, referencing iOS and Android motion design guidelines." },
  { value: "3D Design", label: "3D Design", description: "3D Design: A visual design approach incorporating three-dimensional elements into flat interfaces. Uses realistic lighting, shadows, textures, and depth to create immersion and spatial sense. 3D elements may include dimensional icons, product showcases, scene illustrations, or abstract decorations. Lighting setup is crucial and should be consistent, typically coming from the upper left, creating natural shadows and highlights. Materials can be diverse, simulating metal, glass, plastic, or fabric, with attention to realistic reflections and transparency. Ambient occlusion (AO) can enhance depth perception. 3D elements in interfaces should support interaction like rotation, scaling, or unfolding. Colors should consider light effects rather than flat colors. 3D elements shouldn't be overly complex, maintaining visual balance with the overall interface. Can combine with animation for more vivid experiences, such as 3D elements changing perspective with scrolling. Performance optimization should be considered, especially for mobile devices. The overall design should bring freshness and surprise while maintaining functionality and usability, referencing premium product websites and creative agency portfolios." },
  { value: "Handcrafted/Doodle", label: "Handcrafted/Doodle", description: "Handcrafted/Doodle: A design style imitating hand-drawn work, emphasizing human touch and the natural beauty of imperfection. Graphic elements should appear as if created by hand using pencil, pen, watercolor, or crayon, retaining texture and slight irregularities. Lines should have varying thickness and imperfect connections, simulating the natural feel of real drawing. Colors may appear slightly uneven, as if hand-colored, with slightly misaligned fills. Fonts should be handwriting styles like Comic Sans, Indie Flower, or custom script fonts, avoiding too-perfect typography. Backgrounds can use paper textures, slight wrinkles, or stain effects for authenticity. Decorative elements include casual doodles, arrows, circles, and hand-drawn borders. Icons and buttons designed in hand-drawn form, avoiding perfect geometric shapes. Page layout can be slightly asymmetrical, as if casually arranged in a notebook. The overall design should convey friendliness, creativity, and personalization, suitable for children's content, creative projects, and brands wanting to express unique personality, referencing creative blogs and craft websites." },
  { value: "Micro-interactions", label: "Micro-interactions", description: "Micro-interactions: Small animated feedback, enhances interaction feel" },
  { value: "Asymmetrical Layouts", label: "Asymmetrical Layouts", description: "Asymmetrical Layouts: Breaks balance, creates visual dynamism" },
  { value: "Organic Design", label: "Organic Design", description: "Organic Design: Imitates natural forms and curves" },
];

export interface MarkdownEditorProps {
  initialContent?: string
  placeholder?: string
  onChange?: (content: string) => void
  onAIAction?: (selectedText: string, language: string, style: string , generateType: string) => void
  showAIButton?: boolean
  isGenerating?: boolean
  className?: string
  height?: string | number
  title?: string
  generating?: boolean
  storageKey?: string // 新增属性，用于唯一标识编辑器存储数据
  autoSaveInterval?: number // 自动保存时间间隔（毫秒）
}

export default function MarkdownEditor({
  initialContent = "",
  placeholder = "Write something or select text to use AI...",
  onChange,
  onAIAction,
  showAIButton = false,
  isGenerating = false,
  className = "",
  height = "100%",
  title = "",
  generating = false,
  storageKey = "vditor-content", // 默认存储键
  autoSaveInterval = 5000 // 默认5秒保存一次
}: MarkdownEditorProps) {
  // 只用一个状态来存储编辑器实例，更接近官方示例
  const locale = useLocale();
  const [vd, setVd] = useState<Vditor>()
  const [isTextSelected, setIsTextSelected] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  // Add state for AI settings
  const [aiLanguage, setAiLanguage] = useState(locale === 'zh' ? "Chinese" : "English")
  const [generateType, setGenerateType] = useState("PPT")
  // Use the correct style options based on language selection
  const aiStyleOptions = aiLanguage === "English" ? aiStyleOptionsEnglish : aiStyleOptionsChinese
  // Initialize aiStyle with the description of the default option
  const [aiStyle, setAiStyle] = useState(aiStyleOptions[0].description) 
  const t = useTranslations('MarkdownEditor'); // Initialize useTranslations
  
  // 保存编辑器内容到本地存储
  const saveToLocalStorage = useCallback((content: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, content);
        console.log(`Content saved to localStorage with key: ${storageKey}`);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [storageKey]);

  // 从本地存储加载内容
  const loadFromLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      // 如果 initialContent 被提供并且不仅仅是空字符串或空格，则优先使用它。
      // 这允许父组件强制指定一个特定的起始内容。
      if (initialContent && initialContent.trim() !== "") {
        return initialContent;
      }

      // 否则 (initialContent 为空或仅包含空格)，尝试从 localStorage 加载。
      try {
        const savedContent = localStorage.getItem(storageKey);
        // 如果 localStorage 中有内容，则使用它；否则，使用 initialContent (此时它可能是空字符串或默认值)。
        return savedContent !== null ? savedContent : initialContent;
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        // 加载出错时，回退到 initialContent。
        return initialContent;
      }
    }
    // SSR 或其他情况 (例如，如果上面 initialContent 优先但 window 未定义)，回退到 initialContent。
    return initialContent;
  }, [storageKey, initialContent]);

  // 使用useCallback确保函数不会频繁重建
  const handleContentChange = useCallback((value: string) => {
    if (onChange) {
      onChange(value)
    }
    // 在内容变化时不立即保存，依靠下面的自动保存定时器
  }, [onChange]);
  
  // 处理手动保存
  const handleManualSave = useCallback(() => {
    if (vd) {
      const content = vd.getValue();
      saveToLocalStorage(content);
    }
  }, [vd, saveToLocalStorage]);
  
  // 设置自动保存定时器
  useEffect(() => {
    if (!vd) return;
    
    const intervalId = setInterval(() => {
      const content = vd.getValue();
      saveToLocalStorage(content);
    }, autoSaveInterval);
    
    return () => clearInterval(intervalId);
  }, [vd, autoSaveInterval, saveToLocalStorage]);
  
  // 处理文件上传
  const handleUploadMd = useCallback(() => {
    console.log("上传按钮被点击")
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md'
    input.onchange = async (event) => {
      console.log("文件已选择")
      const target = event.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        const file = target.files[0]
        console.log("开始读取文件:", file.name)
        const reader = new FileReader()
      reader.onload = (e) => {
          console.log("文件读取完成")
          const content = e.target?.result as string
          if (vd && content) {
            console.log("设置编辑器内容")
            vd.setValue(content)
          if (onChange) {
              onChange(content)
            }
          } else {
            console.warn("编辑器实例或内容不存在", { vd: !!vd, contentLength: content?.length })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }, [vd, onChange])
  
  const handleChangeGenerateType = () => {
    setGenerateType(generateType === "PPT" ? "Card" : "PPT")
  }
  // 严格遵循官方示例的初始化模式，最小化依赖项
  useEffect(() => {
    // 唯一的编辑器ID
    const editorId = `vditor-${Math.random().toString(36).substring(2, 9)}`
    if (containerRef.current) {
      // 设置ID以便Vditor可以找到容器
      containerRef.current.id = editorId
      
      // 从本地存储加载内容
      const contentToUse = loadFromLocalStorage();
      // 初始化编辑器，符合官方示例模式
      const vditor = new Vditor(editorId, {
        mode: 'wysiwyg',
        placeholder,
        height: typeof height === 'number' ? height : '100%',
        toolbar: [
          'emoji', 'headings', 'bold', 'italic', 'strike', 'line', 'quote', '|', 
          'list', 'ordered-list', 'check', 'outdent', 'indent', '|', 
          'code', 'inline-code', '|', 
          'upload', 'link', 'table', '|',
          'undo', 'redo', '|',
          'edit-mode', 'content-theme', 'export'
        ],
        // 使用after回调而不是直接设置值
        after: () => {
          // 设置初始内容为本地存储中的内容
          if (contentToUse) {
            vditor.setValue(contentToUse)
          }
          // 保存实例引用
          setVd(vditor)
          
          // 添加自定义事件处理
          const element = document.querySelector(`#${editorId}`) as HTMLElement
          if (element) {
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.type === 'characterData' || mutation.type === 'childList') {
                  const text = vditor.getValue()
                  handleContentChange(text)
                }
              })
            })
            
            // 监听编辑器内容变化
            observer.observe(element, { 
              subtree: true, 
              childList: true, 
              characterData: true 
            })
            
            // 监听选择变化
            element.addEventListener('mouseup', () => {
              const selection = vditor.getSelection()
              setIsTextSelected(!!selection && selection.length > 0)
            })
            element.addEventListener('keyup', () => {
              const selection = vditor.getSelection()
              setIsTextSelected(!!selection && selection.length > 0)
            })
          }
        },
        input: (value) => {
          // 注意：这个回调可能导致重渲染
          // 但我们仍需要，所以使用最小依赖的useCallback包装handleContentChange
          handleContentChange(value)
        },
        preview: {
          hljs: {
            style: 'github',
            lineNumber: true,
          },
          math: {
            inlineDigit: true,
            macros: {},
            engine: 'KaTeX',
          },
        },
        cache: {
          enable: false,
        },
        upload: {
          accept: 'image/*',
          handler: async (files) => {
            console.warn("Vditor upload handler is not implemented.", files)
            return JSON.stringify({
              msg: 'Upload not implemented',
              code: 1,
              data: { errFiles: files.map(f => f.name), succMap: {} }
            })
          },
        },
      })
    }
    
    // 清理函数，符合官方示例
    return () => {
      if (vd) {
        try {
          // 在销毁前保存内容
          const content = vd.getValue();
          saveToLocalStorage(content);
          
          vd.destroy()
          setVd(undefined)
        } catch (error) {
          console.error("Error destroying Vditor:", error)
        }
      }
    }
  // 依赖数组添加loadFromLocalStorage，这样如果storageKey变了会重新初始化
  }, []);
  
  // 禁用AI按钮逻辑
  const isAIButtonDisabled = isGenerating || !isTextSelected
  
  // --- AI Action Button Logic ---
  const handleAIButtonClick = useCallback(() => {
    if (vd && onAIAction && isTextSelected) {
      const selectedText = vd.getSelection()
      if (selectedText) {
        onAIAction(selectedText, aiLanguage, aiStyle, generateType)
      }
    }
  }, [vd, onAIAction, isTextSelected, aiLanguage, aiStyle, generateType])

  return (
    <div className={`vditor-container flex flex-col bg-background ${className}`} style={{ height }}>
      {/* Editor Area with Context Menu */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div ref={containerRef} className="flex-grow relative min-h-0 bg-white" />
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48 bg-background bg-white">
            {/* AI Action Trigger (if text selected and button enabled) */}
            {showAIButton && isTextSelected && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={handleAIButtonClick}
                disabled={isGenerating}
                className="text-blue-600 dark:text-blue-400 focus:text-white focus:bg-blue-600 dark:focus:bg-blue-500 generate-ppt"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {t('buttons.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('buttons.generateAI')} {generateType}
                  </>
                )}
              </ContextMenuItem>
            </>
          )}
          {/* Upload Item */}
          <ContextMenuItem onClick={handleUploadMd}>
             <Upload className="mr-2 h-4 w-4" />
            <span>{t('contextMenu.uploadMarkdown')}</span>
          </ContextMenuItem>
          {/* Save Item */}
          <ContextMenuItem onClick={handleManualSave}>
             <Save className="mr-2 h-4 w-4" />
            <span>{t('contextMenu.save') || "Save"}</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={handleChangeGenerateType}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>{generateType === "PPT" ? t('contextMenu.changeToCard') : t('contextMenu.changeToPPT')}</span>
          </ContextMenuItem>
          {/* Language Submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>{t('contextMenu.languageLabel')}</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48 bg-white">
              <ContextMenuCheckboxItem
                checked={aiLanguage === 'Chinese'}
                onSelect={() => setAiLanguage('Chinese')}
              >
                {t('settings.languageChinese')}
              </ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem
                checked={aiLanguage === 'English'}
                onSelect={() => setAiLanguage('English')}
              >
                {t('settings.languageEnglish')}
              </ContextMenuCheckboxItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Style Submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>{t('contextMenu.styleLabel')}</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-64 max-h-80 overflow-y-auto bg-white">
              {(aiLanguage === "English" ? aiStyleOptionsEnglish : aiStyleOptionsChinese).map((option) => (
                <ContextMenuCheckboxItem
                  key={option.value} 
                  checked={aiStyle === option.description} 
                  onSelect={() => setAiStyle(option.description)} 
                >
                  {option.label}
                  <span className="text-xs text-muted-foreground ml-2 truncate bg-white">
                    ({option.description.split(': ')[1] || option.description})
                  </span>
                </ContextMenuCheckboxItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}

// 获取Markdown内容的辅助函数
export function getMarkdownContent(editor: Vditor | null | undefined): string {
  if (editor) {
    try {
      return editor.getValue();
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error getting Vditor value:", error);
      return "";
    }
  }
  return "";
}

// 获取HTML内容的辅助函数
export function getHTMLContent(editor: Vditor | null | undefined): string {
  if (editor) {
    try {
      return editor.getHTML();
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error getting Vditor HTML:", error);
      return "";
    }
  }
  return "";
}
