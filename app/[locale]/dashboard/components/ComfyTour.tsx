"use client";

import React, { useState, useEffect, useRef } from "react";
import type Shepherd from "shepherd.js";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type ComfyTourProps = {
  run: boolean;
  setRun: (run: boolean) => void;
};

const ComfyTour = ({ run, setRun }: ComfyTourProps): React.ReactNode => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const tourRef = useRef<Shepherd.Tour | null>(null);
  const t = useTranslations("Tour");

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
        text: t("dashboard.welcome"),
        attachTo: {
          element: ".body",
          on: "center",
        },
        buttons: [
          {
            text: t("common.skipButton"),
            action: () => {
              tour.cancel();
              setRun(false);
              if (typeof window !== "undefined") {
                localStorage.setItem("comfyTourComplete", "true");
              }
            },
          },
          {
            text: t("common.nextButton"),
            action: () => tour.next(),
          },
        ],
      });

      // 第二步: 创建文件夹
      tour.addStep({
        id: "create-folder",
        text: t("dashboard.createFolder"),
        attachTo: {
          element: ".create-folder",
          on: "bottom",
        },
        buttons: [
          {
            text: t("common.previousButton"),
            action: () => tour.back(),
          },
        ],
        advanceOn: { selector: ".create-folder", event: "click" }, // 当 #create-folder 被点击时自动进入下一步
      });
      // 第三步: 输入文件夹名称
      tour.addStep({
        id: "create-folder-name",
        text: t("dashboard.folderName"),
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
            text: t("common.nextButton"),
            action: () => tour.next(),
          },
        ],
      });
      // 第四步: 点击创建
      tour.addStep({
        id: "create-folder-button",
        text: t("dashboard.createButton"),
        attachTo: {
          element: ".create-folder-button",
          on: "right",
        },
        buttons: [
          {
            text: t("common.previousButton"),
            action: () => tour.back(),
          },
        ],
        advanceOn: { selector: ".create-folder-button", event: "click" },
      });
      // 第五步: 导航到文件夹
      tour.addStep({
        id: "folder-navigation",
        text: t("dashboard.navigateFolder"),
        attachTo: {
          element: ".body",
          on: "center",
        },
        buttons: [
          {
            text: t("common.previousButton"),
            action: () => tour.back(),
          },
          {
            text: t("common.finishButton"),
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
        text: t("generation.editor"),
        attachTo: {
          element: ".text-editor",
          on: "right",
        },
        buttons: [
          {
            text: t("common.previousButton"),
            action: () => tour.back(),
          },
          {
            text: t("common.nextButton"),
            action: () => tour.next(),
          },
        ],
      });

      // 文本选择
      tour.addStep({
        id: "contextMenu-before-selection",
        text: t("generation.selectText"),
        attachTo: {
          element: ".text-editor",
          on: "right",
        },
        buttons: [
          {
            text: t("common.previousButton"),
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

      // 生成PPT
      tour.addStep({
        id: "generate-ppt",
        text: t("generation.generatePPT"),
        attachTo: {
          element: ".generate-ppt",
          on: "bottom",
        },
        advanceOn: { selector: ".generate-ppt", event: "click" },
      });

      // 完成步骤
      tour.addStep({
        id: "complete",
        text: t("generation.complete"),
        attachTo: {
          element: ".body",
          on: "center",
        },
        buttons: [
          {
            text: t("common.previousButton"),
            action: () => tour.back(),
          },
          {
            text: t("common.finishButton"),
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
