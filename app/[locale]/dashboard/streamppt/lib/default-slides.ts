import type { Slide } from "../types/slide"

export const defaultSlides: Slide[] = [
  {
    id: "welcome",
    title: "欢迎",
    content: "<div class='slide'><h1>欢迎</h1><p>欢迎使用我们的演示平台</p></div>"
  },
  {
    id: "intro",
    title: "介绍",
    content: "<div class='slide'><h1>介绍</h1><p>我们的平台简介</p></div>"
  },
  {
    id: "features",
    title: "功能特点",
    content: "<div class='slide'><h1>功能特点</h1><ul><li>特点1</li><li>特点2</li></ul></div>"
  },
  {
    id: "demo",
    title: "演示",
    content: "<div class='slide'><h1>演示</h1><p>演示内容</p></div>"
  },
  {
    id: "contact",
    title: "联系我们",
    content: "<div class='slide'><h1>联系我们</h1><p>联系方式和信息</p></div>"
  },
]

