"use client";

import React, { useState, useEffect, useRef } from "react";
import type Shepherd from "shepherd.js";
import { usePathname } from "@/i18n/navigation";

type ComfyTourProps = {
  run: boolean;
  setRun: (run: boolean) => void;
};

const ComfyTour = ({ run, setRun }: ComfyTourProps): React.ReactNode => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const tourRef = useRef<Shepherd.Tour | null>(null);

  // 初始化Shepherd导览
  useEffect(() => {
    setMounted(true);

    // 仅当run为true时才初始化和启动导览
    if (mounted && run) {
      // 动态导入Shepherd以避免服务器端渲染错误
      import("shepherd.js").then((ShepherdModule) => {
        const Shepherd = ShepherdModule.default;
        initTour(Shepherd);
      });
    }

    return () => {
      // 组件卸载时取消导览
      if (tourRef.current) {
        tourRef.current.cancel();
      }
    };
  }, [mounted, run, pathname]);

  const initTour = (Shepherd: any) => {
    // 如果已有导览实例，先取消
    if (tourRef.current) {
      tourRef.current.cancel();
    }

    // 导入CSS
    if (typeof document !== "undefined") {
      // 检查是否已加载CSS
      if (!document.getElementById("shepherd-css")) {
        const link = document.createElement("link");
        link.id = "shepherd-css";
        link.rel = "stylesheet";
        link.href =
          "https://cdn.jsdelivr.net/npm/shepherd.js@13.0.0/dist/css/shepherd.css";
        document.head.appendChild(link);
      }
    }

    // 创建新的Shepherd导览实例
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        classes: "shepherd-theme-default",
        scrollTo: true,
        modalOverlayOpeningPadding: 10,
      },
      exitOnEsc: true,
      keyboardNavigation: true,
    });

    // 配置导览步骤
    // 使用简单的字符串包含方式匹配路径
    const isDashboardPath =
      pathname === "/dashboard" ||
      pathname.endsWith("/dashboard") ||
      pathname === "/zh/dashboard" ||
      pathname === "/en/dashboard";

    const isGenerationPath = pathname.includes("/dashboard/generation/");

    console.log("当前路径:", pathname);
    console.log("isDashboardPath:", isDashboardPath);
    console.log("isGenerationPath:", isGenerationPath);

    // 使用简化的路径匹配逻辑
    if (isDashboardPath) {
      // dashboard 页面的教程步骤
      // 第一步: 欢迎屏幕
      tour.addStep({
        id: "welcome",
        text: "欢迎使用SlideCraft AI快速入门教程！让我们带你了解如何将文本内容变成演示文稿。",
        attachTo: {
          element: ".body",
          on: "center",
        },
        buttons: [
          {
            text: "跳过",
            action: () => {
              tour.cancel();
              setRun(false);
              if (typeof window !== "undefined") {
                localStorage.setItem("comfyTourComplete", "true");
              }
            },
          },
          {
            text: "下一步",
            action: () => tour.next(),
          },
        ],
      });

      // 第二步: 创建文件夹
      tour.addStep({
        id: "create-folder",
        text: '第一步：创建一个新文件夹来放你的演示稿，比如叫"make"。',
        attachTo: {
          element: ".create-folder",
          on: "bottom",
        },
        buttons: [
          {
            text: "上一步",
            action: () => tour.back(),
          },
        ],
        advanceOn: { selector: ".create-folder", event: "click" }, // 当 #create-folder 被点击时自动进入下一步
      });
      // 第三步: 输入文件夹名称
      tour.addStep({
        id: "create-folder-name",
        text: "第二步：输入文件夹名称。",
        attachTo: {
          element: ".create-folder-name", // 确保这个类名与您输入框的类名一致
          on: "bottom",
        },
        beforeShowPromise: function () {
          return new Promise<void>((resolve) => {
            const checkElement = () => {
              const el = document.querySelector(".create-folder-name");
              if (el) {
                resolve();
              } else {
                // 如果元素还不存在，则稍后重试
                console.log("等待 .create-folder-name 元素出现...");
                setTimeout(checkElement, 300); // 每300ms检查一次
              }
            };
            checkElement();
          });
        },
        buttons: [
          {
            text: "下一步",
            action: () => tour.next(),
          },
        ],
      });
      // 第四步: 点击创建
      tour.addStep({
        id: "create-folder-button",
        text: "第三步：点击创建按钮。",
        attachTo: {
          element: ".create-folder-button",
          on: "right",
        },
        buttons: [
          {
            text: "上一步",
            action: () => tour.back(),
          },
        ],
        advanceOn: { selector: ".create-folder-button", event: "click" },
      });
      // 第五步: 导航到文件夹
      tour.addStep({
        id: "folder-navigation",
        text: "第四步：进入新建的文件夹。",
        attachTo: {
          element: ".body",
          on: "center",
        },
        buttons: [
          {
            text: "上一步",
            action: () => tour.back(),
          },
          {
            text: "完成",
            action: () => {
              tour.cancel();
              setRun(false);
              if (typeof window !== "undefined") {
                localStorage.setItem("comfyTourComplete", "true");
              }
            },
          },
        ],
      });
    } else if (isGenerationPath) {
      // generation 页面的教程步骤
      // 文本编辑器
      tour.addStep({
        id: "text-editor",
        text: "编辑器已经有我们准备好的文字，你可以直接在左边的编辑器里编辑。",
        attachTo: {
          element: ".text-editor",
          on: "right",
        },
        buttons: [
          {
            text: "上一步",
            action: () => tour.back(),
          },
          {
            text: "下一步",
            action: () => tour.next(),
          },
        ],
      });

      // 文本选择
      tour.addStep({
        id: "contextMenu-before-selection",
        text: "选中你想放在第一张幻灯片上的那段文字，右键点击它",
        attachTo: {
          element: ".text-editor",
          on: "right",
        },
        buttons: [
          {
            text: "上一步",
            action: () => tour.back(),
          },
        ],
        when: {
          show: function () {
            // 当用户右键点击文本区域时（且有文本被选中）自动前进
            const handleRightClick = (event: MouseEvent) => {
              // 检查是否有文本被选中
              const selectedText = window.getSelection()?.toString();
              if (selectedText && selectedText.trim().length > 0) {
                // 有文本被选中并且右键点击，自动前进到下一步
                setTimeout(() => {
                  tour.next();
                }, 300); // 延迟300ms，让用户看到右键菜单
              }
            };

            // 添加右键点击监听器
            document.addEventListener("contextmenu", handleRightClick);

            // 清理函数 - 当步骤隐藏时移除监听器
            return () => {
              document.removeEventListener("contextmenu", handleRightClick);
            };
          },
        },
      });

      // // 样式菜单
      // tour.addStep({
      //   id: 'style-menu',
      //   text: '（可选）右键点击选中的文字，选择一个"Style"（风格），比如"手绘"。',
      //   attachTo: {
      //     element: '.style-menu',
      //     on: 'right'
      //   },
      //   buttons: [
      //     {
      //       text: '上一步',
      //       action: () => tour.back()
      //     },
      //     {
      //       text: '下一步',
      //       action: () => tour.next()
      //     }
      //   ]
      // });

      // 生成PPT
      tour.addStep({
        id: "generate-ppt",
        text: '选择"Generate AI PPT"。',
        attachTo: {
          element: ".generate-ppt",
          on: "bottom",
        },
        advanceOn: { selector: ".generate-ppt", event: "click" },
      });

      // // 标题输入
      // tour.addStep({
      //   id: 'title-input',
      //   text: '在"Title"框里给幻灯片起个名字（比如"1"），然后点"Save HTML"保存。',
      //   attachTo: {
      //     element: '.title-input',
      //     on: 'bottom'
      //   },
      //   buttons: [
      //     {
      //       text: '上一步',
      //       action: () => tour.back()
      //     },
      //     {
      //       text: '下一步',
      //       action: () => tour.next()
      //     }
      //   ]
      // });

      // // 编辑按钮
      // tour.addStep({
      //   id: 'edit-button',
      //   text: '如果想修改生成的幻灯片，点击预览区上方的"Select Element to Edit"。',
      //   attachTo: {
      //     element: '.edit-button',
      //     on: 'bottom'
      //   },
      //   buttons: [
      //     {
      //       text: '上一步',
      //       action: () => tour.back()
      //     },
      //     {
      //       text: '下一步',
      //       action: () => tour.next()
      //     }
      //   ]
      // });

      // // 样式编辑器
      // tour.addStep({
      //   id: 'style-editor',
      //   text: '然后点击幻灯片上想修改的部分（比如文字），就可以在弹出的"Style Editor"里调整字体大小、颜色等。',
      //   attachTo: {
      //     element: '.style-editor',
      //     on: 'left'
      //   },
      //   buttons: [
      //     {
      //       text: '上一步',
      //       action: () => tour.back()
      //     },
      //     {
      //       text: '下一步',
      //       action: () => tour.next()
      //     }
      //   ]
      // });

      // 完成步骤
      tour.addStep({
        id: "complete",
        text: "你已经完成了SlideCraft AI把文本内容做成演示文稿的准备工作！请稍等，我们正在为你生成演示文稿...",
        attachTo: {
          element: ".body",
          on: "center",
        },
        buttons: [
          {
            text: "上一步",
            action: () => tour.back(),
          },
          {
            text: "完成",
            action: () => {
              tour.cancel();
              setRun(false);
              if (typeof window !== "undefined") {
                localStorage.setItem("comfyTourComplete", "true");
              }
            },
          },
        ],
      });
    }
    // else if (pathname === '/dashboard/stream-ppt' || pathname.includes('/dashboard/stream-ppt')) {
    //   // 添加其他步骤...
    //   // 文本编辑器
    //   tour.addStep({
    //     id: 'text-editor',
    //     text: '把你准备好的文字（比如《Make》手册的内容）粘贴到左边的编辑器里。',
    //     attachTo: {
    //       element: '.text-editor',
    //       on: 'left'
    //     },
    //     buttons: [
    //       {
    //         text: '上一步',
    //         action: () => tour.back()
    //       },
    //       {
    //         text: '下一步',
    //         action: () => tour.next()
    //       }
    //     ]
    //   });

    //   // 文本选择
    //   tour.addStep({
    //     id: 'text-selection',
    //     text: '选中你想放在第一张幻灯片上的那段文字。',
    //     attachTo: {
    //       element: '.text-selection',
    //       on: 'bottom'
    //     },
    //     buttons: [
    //       {
    //         text: '上一步',
    //         action: () => tour.back()
    //       },
    //       {
    //         text: '下一步',
    //         action: () => tour.next()
    //       }
    //     ]
    //   });

    //   // 样式菜单
    //   tour.addStep({
    //     id: 'style-menu',
    //     text: '（可选）右键点击选中的文字，选择一个"Style"（风格），比如"手绘"。',
    //     attachTo: {
    //       element: '.style-menu',
    //       on: 'right'
    //     },
    //     buttons: [
    //       {
    //         text: '上一步',
    //         action: () => tour.back()
    //       },
    //       {
    //         text: '下一步',
    //         action: () => tour.next()
    //       }
    //     ]
    //   });

    //   // 生成PPT
    //   tour.addStep({
    //     id: 'generate-ppt',
    //     text: '再次右键点击选中的文字，选择"Generate AI PPT"。',
    //     attachTo: {
    //       element: '.generate-ppt',
    //       on: 'bottom'
    //     },
    //     buttons: [
    //       {
    //         text: '上一步',
    //         action: () => tour.back()
    //       },
    //       {
    //         text: '下一步',
    //         action: () => tour.next()
    //       }
    //     ]
    //   });

    //   // 标题输入
    //   tour.addStep({
    //     id: 'title-input',
    //     text: '在"Title"框里给幻灯片起个名字（比如"1"），然后点"Save HTML"保存。',
    //     attachTo: {
    //       element: '.title-input',
    //       on: 'bottom'
    //     },
    //     buttons: [
    //       {
    //         text: '上一步',
    //         action: () => tour.back()
    //       },
    //       {
    //         text: '下一步',
    //         action: () => tour.next()
    //       }
    //     ]
    //   });

    //   // 编辑按钮
    //   tour.addStep({
    //     id: 'edit-button',
    //     text: '如果想修改生成的幻灯片，点击预览区上方的"Select Element to Edit"。',
    //     attachTo: {
    //       element: '.edit-button',
    //       on: 'bottom'
    //     },
    //     buttons: [
    //       {
    //         text: '上一步',
    //         action: () => tour.back()
    //       },
    //       {
    //         text: '下一步',
    //         action: () => tour.next()
    //       }
    //     ]
    //   });

    //   // 样式编辑器
    //   tour.addStep({
    //     id: 'style-editor',
    //     text: '然后点击幻灯片上想修改的部分（比如文字），就可以在弹出的"Style Editor"里调整字体大小、颜色等。',
    //     attachTo: {
    //       element: '.style-editor',
    //       on: 'left'
    //     },
    //     buttons: [
    //       {
    //         text: '上一步',
    //         action: () => tour.back()
    //       },
    //       {
    //         text: '完成',
    //         action: () => {
    //           tour.cancel();
    //           setRun(false);
    //           if (typeof window !== 'undefined') {
    //             localStorage.setItem('comfyTourComplete', 'true');
    //           }
    //         }
    //       }
    //     ]
    //   });
    // }

    // 保存导览实例引用
    tourRef.current = tour;

    // 启动导览
    tour.start();
  };

  if (!mounted) {
    return null;
  }

  return null; // Shepherd.js不需要渲染任何内容，它直接操作DOM
};

export default ComfyTour;
