"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { ElementSelector } from "@/components/element-selector";
import { FriendlyEditor } from "@/app/[locale]/dashboard/components/cssEditor/friendly-editor";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Download,
  FileDown,
  ImageDown,
  Save,
  Maximize,
  Minimize,
  Edit,
  Fullscreen
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiClient from "@/libs/api";
import {
  saveHtmlToLocalStorage,
  loadHtmlFromLocalStorage,
  hasSavedHtml,
  clearSavedHtml,
} from "@/app/[locale]/dashboard/utils/localStorage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import html2canvas from "html2canvas";
import { useTranslations } from 'next-intl';
import { Input } from "@/components/ui/input";

// Helper function to inject styles into an iframe
const injectStylesIntoIframe = (
  iframeDoc: Document,
  styles: string
): HTMLStyleElement => {
  let styleElement = iframeDoc.getElementById("editor-injected-styles") as HTMLStyleElement | null;
  if (!styleElement) {
      styleElement = iframeDoc.createElement("style");
      styleElement.id = "editor-injected-styles";
      iframeDoc.head.appendChild(styleElement);
  }
  styleElement.textContent = styles;
  return styleElement;
};

// Helper function to remove injected styles
const removeInjectedStylesFromIframe = (iframeDoc: Document) => {
  const styleElement = iframeDoc.getElementById("editor-injected-styles");
  // Check if the element exists AND is a child of the current iframe's head
  if (styleElement && iframeDoc.head.contains(styleElement)) {
    try {
      iframeDoc.head.removeChild(styleElement);
      console.log("Successfully removed injected styles.");
    } catch (error) {
      console.error("Error removing injected styles:", error, {
        styleElementParent: styleElement.parentNode,
        iframeHead: iframeDoc.head
      });
    }
  } else if (styleElement) {
    console.warn("Found style element, but it's not a child of the current iframe head. Skipping removal.", {
        styleElementParent: styleElement.parentNode,
        iframeHead: iframeDoc.head
      });
  } else {
    // Optional: Log if needed, but generally okay if it doesn't exist
    // console.log("Injected style element not found. No removal needed.");
  }
};

// Selection mode styles to be injected
const selectionModeStyles = `
    body.selecting {
      cursor: default; /* Default cursor for body */
      position: relative;
      z-index: 2;
    }
    body.selecting * {
      pointer-events: auto !important;
      cursor: pointer !important; /* Make all elements clickable */
    }
    body.selecting [data-no-select],
    body.selecting [data-no-select] * {
      pointer-events: none !important; /* Disable events for non-selectable */
      cursor: not-allowed !important;
    }
    body.selecting *:not([data-no-select]):not([data-no-select] *):hover {
      outline: 2px dashed #3b82f6 !important;
      outline-offset: 2px !important;
      background-color: rgba(59, 130, 246, 0.05) !important;
      position: relative !important;
      z-index: 3 !important;
    }
    /* Ensure text nodes can trigger events on their parent */
    body.selecting p, body.selecting span, body.selecting div,
    body.selecting h1, body.selecting h2, body.selecting h3,
    body.selecting h4, body.selecting h5, body.selecting h6,
    body.selecting li, body.selecting a, body.selecting strong,
    body.selecting em, body.selecting code {
      position: relative !important; /* Needed for z-index */
      z-index: 1 !important;
    }
  `;

export function HtmlPreview({ 
  htmlContent, 
  folderName,
  onEditModeChange
}: { 
  htmlContent: string, 
  folderName: string,
  onEditModeChange?: (isEditMode: boolean) => void
}) {
  const t = useTranslations('HtmlPreview');
  const [htmlTitle, setHtmlTitle] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  const [selectedElementPath, setSelectedElementPath] = useState<string | null>(
    null
  );
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const elementIdCounter = useRef(0);
  const [renderKey, setRenderKey] = useState(0);
  const [activePreviewTab, setActivePreviewTab] = useState<"ppt" | "html">(
    "ppt"
  );
  const [localHtmlContent, setLocalHtmlContent] = useState(htmlContent || "");
  const [showEditor, setShowEditor] = useState(false);
  const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });
  const [appliedChanges, setAppliedChanges] = useState<
    Array<{ element: string; before: string; after: string }>
  >([]);
  const [processingFeedback, setProcessingFeedback] = useState<string | null>(
    null
  );
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [isSelecting, setIsSelecting] = useState(false);
  const [originalClasses, setOriginalClasses] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeDocRef = useRef<Document | null>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  // --- Path Functions ---

  // Modified getElementPath for more logging
  const getElementPath = useCallback(
    (element: HTMLElement, contextDoc: Document = document): string => {
      let path = [];
      let current: HTMLElement | null = element;

      while (
        current &&
        current !== contextDoc.body &&
        current !== contextDoc.documentElement
      ) {
        let selector = current.tagName.toLowerCase();
        if (current.id) {
          selector += `#${current.id}`;
          // Potentially break early if ID is unique enough
        } else {
          if (current.className) {
            // Keep classes simple for stability
            const stableClasses = current.className
              .split(" ")
              .filter(
                (cls) =>
                  cls &&
                  !cls.startsWith("hover:") &&
                  !cls.startsWith("focus:") &&
                  !cls.includes(":")
              ) // Avoid stateful/complex classes
              .join(".");
            if (stableClasses) selector += "." + stableClasses;
          }
          if (current.parentElement) {
            const siblings = Array.from(current.parentElement.children);
            // Filter siblings by the same tag name before getting index
            const sameTagSiblings = siblings.filter(
              (sib) => sib.tagName === current.tagName
            );
            const index = sameTagSiblings.indexOf(current);
            if (sameTagSiblings.length > 1) {
              // Only add nth-of-type if necessary
              selector += `:nth-of-type(${index + 1})`;
            }
          }
        }

        path.unshift(selector);
        current = current.parentElement as HTMLElement | null;
      }
      const finalPath = path.join(" > ");
      console.log("Generated Path:", finalPath, "for element:", element);
      return finalPath;
    },
    []
  );

  // Modified findElementByPath for more logging and fallback mechanisms
  const findElementByPath = useCallback(
    (path: string, container: Document | HTMLElement): HTMLElement | null => {
      console.log(`findElementByPath: Attempting to find path: "${path}"`);

      try {
        const root = container instanceof Document ? container.body : container;
        if (!root) {
          console.error(
            "findElementByPath: Root element (body or container) not found."
          );
          return null;
        }

        // Try the exact path first
        let foundElement = root.querySelector(path) as HTMLElement | null;

        // If that fails, try with simplified path (fallback mechanism)
        if (!foundElement) {
          console.warn(
            `findElementByPath: Primary query failed for path: "${path}". Trying fallbacks...`
          );

          // Fallback 1: Try removing nth-of-type selectors which can be brittle
          const simplifiedPath = path.replace(/:nth-of-type\(\d+\)/g, "");
          if (simplifiedPath !== path) {
            console.log(
              `findElementByPath: Trying simplified path: "${simplifiedPath}"`
            );
            foundElement = root.querySelector(
              simplifiedPath
            ) as HTMLElement | null;
          }

          // Fallback 2: Try with tag names only (most basic)
          if (!foundElement) {
            const tagOnlyPath = path
              .split(" > ")
              .map((part) => part.split(".")[0].split("#")[0].split(":")[0])
              .join(" > ");

            if (tagOnlyPath !== path && tagOnlyPath !== simplifiedPath) {
              console.log(
                `findElementByPath: Trying tag-only path: "${tagOnlyPath}"`
              );
              foundElement = root.querySelector(
                tagOnlyPath
              ) as HTMLElement | null;
            }
          }

          // Fallback 3: Try individual segments to find closest match
          if (!foundElement) {
            const segments = path.split(" > ");
            // Try progressively shorter path segments, starting from the end
            for (let i = segments.length - 1; i > 0; i--) {
              const partialPath = segments.slice(0, i).join(" > ");
              console.log(
                `findElementByPath: Trying partial path: "${partialPath}"`
              );
              const partialElement = root.querySelector(
                partialPath
              ) as HTMLElement | null;

              if (partialElement) {
                // Found a partial match, now try to find child that most closely matches
                const remainingSegments = segments.slice(i);
                const lastSegment =
                  remainingSegments[remainingSegments.length - 1];
                const tagName = lastSegment
                  .split(".")[0]
                  .split("#")[0]
                  .split(":")[0];

                // Find all elements of target type within the partial element
                const candidates = Array.from(
                  partialElement.querySelectorAll(tagName)
                );
                if (candidates.length > 0) {
                  console.log(
                    `findElementByPath: Found ${candidates.length} potential elements`
                  );
                  // Just use the first matching element of this type as a fallback
                  foundElement = candidates[0] as HTMLElement;
                  break;
                }
              }
            }
          }
        }

        if (foundElement) {
          console.log(
            `findElementByPath: Successfully found element for path: "${path}"`,
            foundElement
          );
        } else {
          console.error(
            `findElementByPath: All attempts to find element failed for path: "${path}"`
          );
        }

        return foundElement;
      } catch (error) {
        console.error(
          `findElementByPath: Error querying path: "${path}"`,
          error
        );
        return null;
      }
    },
    []
  );

  // Toggle selection mode
  useEffect(() => {
    if (isSelecting) {
      document.body.classList.add("selecting");
    } else {
      document.body.classList.remove("selecting");
    }

    return () => {
      document.body.classList.remove("selecting");
    };
  }, [isSelecting]);

  // Update local HTML content when the prop changes
  useEffect(() => {
    if (htmlContent) {
      setLocalHtmlContent(htmlContent);
      // 保存到localStorage
      saveHtmlToLocalStorage(htmlContent);
    }
  }, [htmlContent]);

  // 初始化时，如果props没有提供html内容，尝试从localStorage加载
  useEffect(() => {
    if (!htmlContent) {
      const savedHtml = loadHtmlFromLocalStorage();
      if (savedHtml) {
        setLocalHtmlContent(savedHtml);
        console.log("成功从本地存储加载HTML内容");
      }
    }
  }, []);

  // 清除本地存储的HTML内容
  const handleClearStorage = () => {
    clearSavedHtml();
    setLocalHtmlContent("");
    setRenderKey((prev) => prev + 1);
    setProcessingFeedback(t('feedback.storageCleared'));
    setTimeout(() => setProcessingFeedback(null), 2000);
    console.log("Cleared local storage for HTML content");
  };

  const handleSaveHtml = async () => {
    // 检查标题是否为空或仅包含空格
    if ((!htmlTitle || htmlTitle.trim() === "") && htmlContent.length <= 50) {
      toast.error(t('feedback.titleRequired'));
      return; // 阻止保存
    }

    const htmlContentToSave = iframeRef.current?.contentDocument?.documentElement.outerHTML;
    const formData = new URLSearchParams();
    formData.append('folderName', folderName);
    formData.append('content', htmlContentToSave);
    formData.append('title', htmlTitle);
    if (htmlContentToSave) {
      try {
        const response = await apiClient.post('/html-ppt/createHtml', formData)
        if(response.data.htmlId) {
          toast.success(t('feedback.htmlSavedSuccess'));
        } else {
          toast.error(t('feedback.htmlSavedFailed'));
        }
      } catch (error) {
        toast.error(t('feedback.htmlSavedFailed'));
      }
    }
  };

  // 改进下载HTML功能，添加PPT模式下的样式
  const handleDownloadHtml = () => {
    try {
      if (!iframeRef.current || !iframeRef.current.contentDocument) {
        throw new Error(t('errors.iframeNotAvailable'));
      }
      const iframeDoc = iframeRef.current.contentDocument;
      const htmlContentToDownload = iframeDoc.documentElement.outerHTML;

      const blob = new Blob([htmlContentToDownload], { type: "text/html" });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      const filePrefix = activePreviewTab === "ppt" ? t('downloadPrefix.ppt') : t('downloadPrefix.html');
      downloadLink.download = `${filePrefix}-${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);

      setProcessingFeedback(t('feedback.htmlDownloaded'));
    } catch (error) {
      console.error("Error downloading HTML:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setProcessingFeedback(t('feedback.downloadFailed', { error: errorMessage }));
    } finally {
      setTimeout(() => setProcessingFeedback(null), 3000);
    }
  };

  // 使用html2canvas下载图片 - 修正并处理动画
  const handleDownloadImage = async () => {
    setProcessingFeedback(t('feedback.preparingScreenshot'));

    if (!iframeRef.current) {
      setProcessingFeedback(t('errors.iframeNotFound'));
      setTimeout(() => setProcessingFeedback(null), 3000);
      return;
    }
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) {
      setProcessingFeedback(t('errors.iframeDocNotAccessible'));
      setTimeout(() => setProcessingFeedback(null), 3000);
      return;
    }
    const iframeBody = iframeDoc.body;
    if (!iframeBody) {
      setProcessingFeedback(t('errors.iframeBodyNotAccessible'));
      setTimeout(() => setProcessingFeedback(null), 3000);
      return;
    }

    const disableAnimationStyleId = "temp-disable-animations";
    let tempStyleElement: HTMLStyleElement | null = null;
    try {
      setProcessingFeedback(t('feedback.disablingAnimations'));
      tempStyleElement = iframeDoc.createElement("style");
      tempStyleElement.id = disableAnimationStyleId;
      tempStyleElement.textContent = `
        * {
          animation: none !important;
          transition: none !important;
          scroll-behavior: auto !important;
        }
      `;
      iframeDoc.head.appendChild(tempStyleElement);

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 50));

      setProcessingFeedback(t('feedback.generatingImage'));
      const canvas = await html2canvas(iframeBody, {
        backgroundColor: getComputedStyle(iframeBody).backgroundColor || "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        foreignObjectRendering: false,
      });

      if (tempStyleElement) {
        iframeDoc.head.removeChild(tempStyleElement);
        tempStyleElement = null;
      }
      setProcessingFeedback(t('feedback.processingImage'));

      try {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error(t('errors.blobCreationFailed'));
          }
          const url = URL.createObjectURL(blob);
          const downloadLink = document.createElement("a");
          const filePrefix = activePreviewTab === "ppt" ? t('downloadPrefix.ppt') : t('downloadPrefix.html');
          downloadLink.download = `${filePrefix}-${new Date().toISOString().slice(0, 10)}.png`;
          downloadLink.href = url;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          setTimeout(() => URL.revokeObjectURL(url), 100);
          setProcessingFeedback(t('feedback.imageDownloaded'));
          setTimeout(() => setProcessingFeedback(null), 2000);
        }, "image/png");
      } catch (blobError: any) {
        console.error("Error creating Blob:", blobError);
        try {
          const imgData = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          const filePrefix = activePreviewTab === "ppt" ? t('downloadPrefix.ppt') : t('downloadPrefix.html');
          downloadLink.download = `${filePrefix}-${new Date().toISOString().slice(0, 10)}.png`;
          downloadLink.href = imgData;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          setProcessingFeedback(t('feedback.imageDownloaded'));
          setTimeout(() => setProcessingFeedback(null), 2000);
        } catch (dataUrlError: any) {
           throw new Error(t('errors.downloadLinkCreationFailed', { error: dataUrlError.message }));
        }
      }
    } catch (error) {
      console.error("Error downloading image:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setProcessingFeedback(t('feedback.imageDownloadFailed', { error: errorMessage }));
      setTimeout(() => setProcessingFeedback(null), 3000);
    } finally {
      if (tempStyleElement && iframeDoc?.head.contains(tempStyleElement)) {
        iframeDoc.head.removeChild(tempStyleElement);
        console.log("Ensured temporary animation style removed");
      }
    }
  };

  // --- Iframe Setup and Event Handling ---

  // Function to set up listeners inside the iframe
  const setupIframeListeners = useCallback(() => {
    if (
      !iframeRef.current ||
      !iframeRef.current.contentWindow ||
      !iframeRef.current.contentDocument
    ) {
      console.log("Iframe not ready for listeners yet");
      return;
    }
    const iframeDoc = iframeRef.current.contentDocument;
    iframeDocRef.current = iframeDoc; // Store for use in handlers

    if (isSelecting) {
      console.log("Setting up iframe listeners for selection");
      iframeDoc.body.classList.add("selecting");
      injectStylesIntoIframe(iframeDoc, selectionModeStyles);

      // Define handlers within the scope where iframeDoc is current
      const handleIframeClick = (e: MouseEvent) => {
        console.log("--- handleIframeClick START ---");
        const target = e.target as HTMLElement;
        const iframeDoc = iframeRef.current?.contentDocument;

        if (!iframeDoc) {
          console.error("handleIframeClick: iframeDoc is null!");
          return;
        }

        console.log("handleIframeClick: iframeDoc found. Current head content:", iframeDoc.head.innerHTML);

        if (
          target.hasAttribute("data-no-select") ||
          target.closest("[data-no-select]")
        ) {
          console.log("handleIframeClick: Clicked element is not selectable [data-no-select]. Exiting.");
          return;
        }

        // 添加更多调试信息
        console.log("原始点击元素:", {
          tagName: target.tagName,
          className: target.className,
          id: target.id,
          textContent: target.textContent?.substring(0, 20) || "(empty)",
        });

        let bestElement = target;

        // 保持最原始的选择逻辑，避免过度选择父元素
        // 只在极少数情况下选择父元素（几乎没有内容或尺寸的元素）
        const rect = bestElement.getBoundingClientRect();
        if (
          (rect.width === 0 && rect.height === 0) ||
          (bestElement.tagName === "SPAN" && !bestElement.textContent?.trim())
        ) {
          console.log("元素完全空白，尝试查找有意义的父元素");

          let parent = bestElement.parentElement;
          if (parent && !parent.hasAttribute("data-no-select")) {
            bestElement = parent;
            console.log("选择父元素:", parent.tagName, parent.className);
          }
        }

        // Simplified selection logic for iframe, can add heuristics back if needed
        console.log(
          "最终选择的元素:",
          bestElement.tagName,
          bestElement.className
        );

        const elementPath = getElementPath(bestElement, iframeDoc);
        const currentClassNames = bestElement.className || "";

        console.log("Selected element path (iframe):", elementPath);

        setSelectedElementPath(elementPath);
        setSelectedElement(bestElement); // Store the actual iframe element reference
        setOriginalClasses(currentClassNames);

        // --- Add logic to set temporary editing ID ---
        const tempId = `edit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        try {
          bestElement.setAttribute('data-editing-id', tempId);
          setEditingElementId(tempId);
          console.log(`handleIframeClick: Set data-editing-id='${tempId}' on element and updated state.`);
        } catch (error) {
          console.error("handleIframeClick: Failed to set data-editing-id on element:", error);
          // Optional: Handle error, maybe don't show editor?
        }
        // --- End temporary ID logic ---

        console.log("handleIframeClick: States set - selectedElementPath:", elementPath, "originalClasses:", currentClassNames, "editingElementId:", tempId);

        // Calculate position relative to main window
        const iframeRect = iframeRef.current!.getBoundingClientRect();
        const elementRect = bestElement.getBoundingClientRect(); // Relative to iframe viewport

        const editorWidth = 340; // Approx editor width
        const editorHeight = 500; // Approx editor height
        const padding = 10;

        // Calculate position relative to main window viewport
        let idealX = iframeRect.left + elementRect.right + padding;
        let idealY = iframeRect.top + elementRect.top;

        // Adjust X position
        if (idealX + editorWidth > window.innerWidth - padding) {
          // Check right boundary
          idealX = iframeRect.left + elementRect.left - editorWidth - padding; // Try left
          if (idealX < padding) {
            // If left also fails, center horizontally
            idealX = (window.innerWidth - editorWidth) / 2;
          }
        }
        idealX = Math.max(padding, idealX); // Ensure within left boundary

        // Adjust Y position
        if (idealY + editorHeight > window.innerHeight - padding) {
          // Check bottom boundary
          idealY = window.innerHeight - editorHeight - padding; // Align to bottom
        }
        idealY = Math.max(padding, idealY); // Ensure within top boundary

        setEditorPosition({ x: idealX, y: idealY });
        console.log("handleIframeClick: Editor position calculated:", { x: idealX, y: idealY });

        setShowEditor(true);          // <--- 标记为显示编辑器
        console.log("handleIframeClick: setShowEditor(true) called.");
        setIsSelecting(false);         // <--- 几乎立刻标记为退出选择模式

        console.log("handleIframeClick: setIsSelecting(false) will be called after delay."); // 可以修改日志信息
        console.log("--- handleIframeClick END ---");
      };

      const handleIframeMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
          target.hasAttribute("data-no-select") ||
          target.closest("[data-no-select]")
        ) {
          target.style.cursor = "not-allowed";
          return;
        }
        // Styling is now handled by injected CSS :hover rule
        target.style.cursor = "pointer";
      };

      const handleIframeMouseOut = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        target.style.cursor = ""; // Reset cursor
        // Outline is removed automatically by CSS
      };

      iframeDoc.body.addEventListener("click", handleIframeClick, true); // Use capture phase
      iframeDoc.body.addEventListener("mouseover", handleIframeMouseOver);
      iframeDoc.body.addEventListener("mouseout", handleIframeMouseOut);

      // Store handlers to remove them later
      (iframeRef.current as any).__editor_listeners = {
        click: handleIframeClick,
        mouseover: handleIframeMouseOver,
        mouseout: handleIframeMouseOut,
      };
    } else {
      // Cleanup listeners and styles if selection mode is off
      cleanupIframeListeners();
    }
  }, [isSelecting, getElementPath]); // Add dependencies

  // Function to clean up listeners and styles
  const cleanupIframeListeners = () => {
    if (
      iframeRef.current &&
      (iframeRef.current as any).__editor_listeners &&
      iframeDocRef.current
    ) {
      console.log("Cleaning up iframe listeners");
      const listeners = (iframeRef.current as any).__editor_listeners;
      const iframeDoc = iframeDocRef.current;
      iframeDoc.body.removeEventListener("click", listeners.click, true);
      iframeDoc.body.removeEventListener("mouseover", listeners.mouseover);
      iframeDoc.body.removeEventListener("mouseout", listeners.mouseout);
      iframeDoc.body.classList.remove("selecting");

      // 添加日志
      console.log("Before removeInjectedStylesFromIframe, head HTML:", iframeDoc.head.innerHTML);
      removeInjectedStylesFromIframe(iframeDoc);
      console.log("After removeInjectedStylesFromIframe, head HTML:", iframeDoc.head.innerHTML); // 可能需要稍等DOM更新，或者在try/finally里log

      (iframeRef.current as any).__editor_listeners = null; // Clear stored listeners
      iframeDocRef.current = null; // Clear doc ref
    }
  };

  // Effect to setup/cleanup iframe listeners when selection mode changes or iframe loads
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      console.log("Iframe loaded, setting up listeners if needed.");
      // Small delay to ensure contentDocument is fully accessible after load event
      setTimeout(() => {
        if (isSelecting) {
          setupIframeListeners();
        }
      }, 50);
    };

    if (
      iframe.contentDocument &&
      iframe.contentDocument.readyState === "complete"
    ) {
      // If already loaded (e.g., on hot reload or quick tab switch)
      handleLoad();
    } else {
      iframe.addEventListener("load", handleLoad);
    }

    // Trigger setup/cleanup immediately if isSelecting changes while iframe is loaded
    if (
      iframe.contentDocument &&
      iframe.contentDocument.readyState === "complete"
    ) {
      if (isSelecting) {
        setupIframeListeners();
      } else {
        cleanupIframeListeners();
      }
    }

    return () => {
      iframe.removeEventListener("load", handleLoad);
      // Ensure cleanup happens when component unmounts or isSelecting turns false
      cleanupIframeListeners();
    };
  }, [isSelecting, setupIframeListeners]); // setupIframeListeners is memoized by useCallback

  // --- Button Handlers (Early Definitions) ---
  const handleStartSelecting = useCallback(() => {
    console.log("handleStartSelecting: Called");
    setSelectedElement(null);
    setSelectedElementPath(null);
    setShowEditor(false);
    // Ensure any previous temporary ID is cleared if selection restarts
    if (editingElementId) {
      const iframeDoc = iframeRef.current?.contentDocument;
      if (iframeDoc) {
        const prevElement = iframeDoc.querySelector(`[data-editing-id="${editingElementId}"]`);
        prevElement?.removeAttribute('data-editing-id');
        console.log(`handleStartSelecting: Removed previous data-editing-id '${editingElementId}'`);
      }
      setEditingElementId(null);
    }
    setIsSelecting(true); // Trigger the useEffect for setup
    console.log("handleStartSelecting: Set isSelecting = true");
    // REMOVED setTimeout for adding class/styles - useEffect handles setup
  }, [editingElementId]); // Added editingElementId dependency for cleanup logic

  const handleCancelSelecting = useCallback(() => {
    setIsSelecting(false);
    if (iframeRef.current && iframeRef.current.contentDocument) {
      const iframeDoc = iframeRef.current.contentDocument;
      iframeDoc.body.classList.remove("selecting");
      removeInjectedStylesFromIframe(iframeDoc);
    }
    setShowEditor(false);
    setSelectedElement(null);
    setSelectedElementPath(null);
    console.log("Canceled selection mode (iframe)");
  }, []);

  const handleCloseEditor = useCallback(() => {
    setShowEditor(false);
    setTimeout(() => {
      setSelectedElement(null);
      setSelectedElementPath(null);
      setEditingElementId(null);
    }, 100);
  }, []);

  const handleApplyChanges = useCallback(
    (newClasses: string) => {
      if (
        editingElementId &&
        iframeRef.current &&
        iframeRef.current.contentDocument
      ) {
        setProcessingFeedback(t('feedback.applyingStyles'));
        const iframeDoc = iframeRef.current.contentDocument;
        console.log("handleApplyChanges: Finding element with ID:", editingElementId);

        let elementInIframe: HTMLElement | null = null;
        try {
          elementInIframe = iframeDoc.querySelector(
            `[data-editing-id="${editingElementId}"]`
          ) as HTMLElement | null;
        } catch (findError) {
           console.error("Error finding element by ID:", findError);
           setProcessingFeedback(t('errors.findElementFailed'));
           setTimeout(() => setProcessingFeedback(null), 3000);
           setEditingElementId(null);
           setShowEditor(false);
           return;
        }

        if (elementInIframe) {
          setAppliedChanges((prev) => [
            ...prev,
            {
              element: selectedElementPath || `ID: ${editingElementId}`,
              before: originalClasses,
              after: newClasses,
            },
          ]);

          try {
            console.log("Applying new class name:", newClasses, "to element:", elementInIframe);
            const originalStyle = elementInIframe.getAttribute('style');
            elementInIframe.className = newClasses;

            if (elementInIframe.className !== newClasses) {
              console.warn("Class name did not apply correctly, force setting via setAttribute");
              elementInIframe.setAttribute("class", newClasses);
            }
            if (originalStyle && !elementInIframe.getAttribute('style')) {
                 console.warn("Style attribute was cleared, restoring original style:", originalStyle);
                 elementInIframe.setAttribute('style', originalStyle);
             }

            elementInIframe.removeAttribute('data-editing-id');
            console.log("Removed temporary ID:", editingElementId);

            // --- 清理操作：在保存前移除由 Tailwind CDN 生成的 <style> 标签 ---
            try {
              const head = iframeDoc.head;
              const styleTags = head.querySelectorAll('style');
              styleTags.forEach(tag => {
                // 识别 Tailwind CDN 生成的样式 (通常包含大量 CSS 变量)
                // 如果需要保留其他 <style> 标签（比如动画），需要更精确的识别逻辑
                // 这里我们假设主要移除包含 '--tw-' 变量的样式块
                if (tag.textContent && tag.textContent.includes('--tw-')) {
                   console.log("Removing Tailwind CDN generated style tag before save.");
                   head.removeChild(tag);
                }
              });
            } catch (cleanupError) {
              console.error("Error cleaning up style tags before save:", cleanupError);
              // 即使清理失败，也继续尝试保存
            }
            // --- 清理操作结束 ---

            const updatedHtml = iframeDoc.documentElement.outerHTML;
            setLocalHtmlContent(updatedHtml);
            saveHtmlToLocalStorage(updatedHtml);
            setRenderKey((prev) => prev + 1);

            console.log("Applied changes, updated state, triggered re-render");
            setProcessingFeedback(t('feedback.stylesAppliedSuccess'));
          } catch (error) {
            console.error("Error applying changes to iframe:", error);
            setProcessingFeedback(t('errors.applyStylesFailed'));
            if (elementInIframe && elementInIframe.hasAttribute('data-editing-id')) {
                 try {
                    elementInIframe.removeAttribute('data-editing-id');
                 } catch (e) {
                    console.error("Error removing ID during error handling:", e);
                 }
            }
          } finally {
            if (elementInIframe?.hasAttribute('data-editing-id')) {
                try {
                   elementInIframe.removeAttribute('data-editing-id');
                } catch (e) {
                   console.error("Error in final ID cleanup:", e);
                }
            }
            setTimeout(() => setProcessingFeedback(null), 2000);
            setShowEditor(false);
            setSelectedElement(null);
            setSelectedElementPath(null);
            setEditingElementId(null);
            setIsSelecting(false);
          }
        } else {
          console.error("handleApplyChanges: ERROR - Could not find element with ID:", editingElementId);
          setProcessingFeedback(t('errors.findElementByIdFailed', { id: editingElementId || 'unknown' }));
          setTimeout(() => setProcessingFeedback(null), 3000);
          setShowEditor(false);
          setSelectedElement(null);
          setSelectedElementPath(null);
          setEditingElementId(null);
          setIsSelecting(false);
        }
      } else {
        console.warn("handleApplyChanges: Cannot apply changes: No element ID or iframe not ready.");
        if (!editingElementId) console.warn("Reason: editingElementId is null");
        if (!iframeRef.current) console.warn("Reason: iframeRef is null");
        if (iframeRef.current && !iframeRef.current.contentDocument) console.warn("Reason: iframe contentDocument is null");

        setProcessingFeedback(t('errors.cannotApplyChanges'));
        setTimeout(() => setProcessingFeedback(null), 3000);
        setEditingElementId(null);
        setShowEditor(false);
      }
    },
    [
      editingElementId,
      selectedElementPath,
      originalClasses,
      setRenderKey,
      t
    ]
  );

  const handleNativeFullscreen = useCallback(() => {
    console.log("handleNativeFullscreen triggered");
    const iframeElement = iframeRef.current;
    
    if (!document.fullscreenElement) {
      if (iframeElement) {
        console.log("Attempting to request native fullscreen on iframe...");
        iframeElement.requestFullscreen().then(() => {
          console.log("Native fullscreen request successful");
        }).catch(err => {
          console.error(`Error attempting to enable native fullscreen: ${err.message}`);
          setProcessingFeedback(t('errors.fullscreenFailed'));
          setTimeout(() => setProcessingFeedback(null), 3000);
        });
      } else {
        console.error("Cannot request fullscreen: iframeElement is null");
      }
    } else {
      console.log("Attempting to exit native fullscreen...");
      document.exitFullscreen().then(() => {
        console.log("Native fullscreen exit successful");
      }).catch(err => {
        console.error(`Error attempting to exit native fullscreen: ${err.message}`);
      });
    }
  }, [t]);

  const handleToggleFullscreen = useCallback(() => {
    console.log("handleToggleFullscreen (edit mode) triggered");
    // 直接切换全屏状态，不再调用浏览器API
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    
    // 调用回调通知父组件编辑模式状态变化
    if (onEditModeChange) {
      console.log("通知父组件编辑模式变为:", newState);
      onEditModeChange(newState);
    }
    
    // 如果当前处于选择模式并且正在退出全屏，取消选择
    if (isFullscreen && isSelecting) {
      handleCancelSelecting();
    }
  }, [isFullscreen, isSelecting, handleCancelSelecting, onEditModeChange]);

  const handleFullscreenSelect = useCallback(() => {
    console.log("handleFullscreenSelect: Called");
    handleStartSelecting();
  }, [handleStartSelecting]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;
      console.log("fullscreenchange event detected. Element:", fullscreenElement);
      if (fullscreenElement === iframeRef.current) {
        console.log("Entered native fullscreen on iframe.");
        setIsNativeFullscreen(true);
      } else {
        if (isNativeFullscreen) {
            console.log("Exited native fullscreen.");
            setIsNativeFullscreen(false);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isNativeFullscreen]);

  useEffect(() => {
    const iframeElement = iframeRef.current;
    if (iframeElement) {
      if (isNativeFullscreen) {
        console.log("Applying native fullscreen styles to iframe");
        iframeElement.style.width = '100vw';
        iframeElement.style.height = '100vh';
        iframeElement.style.position = 'fixed';
        iframeElement.style.top = '0';
        iframeElement.style.left = '0';
        iframeElement.style.zIndex = '2147483647';
      } else {
        console.log("Removing native fullscreen styles from iframe");
        iframeElement.style.width = '';
        iframeElement.style.height = '';
        iframeElement.style.position = '';
        iframeElement.style.top = '';
        iframeElement.style.left = '';
        iframeElement.style.zIndex = '';
      }
    }
  }, [isNativeFullscreen]);

  return (
    <>
      <div
        className={`bg-base-20 px-4 py-2 border-b flex items-center justify-between sticky top-0 z-10 flex-shrink-0 ${isFullscreen ? 'hidden' : ''}`}
        data-no-select
      >
        <div className="flex items-center space-x-4 flex-grow">
          <h3 className="text-sm font-medium mr-4" data-no-select>
            {t('title')}
          </h3>
        </div>
        <div className="flex items-center space-x-2" data-no-select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                title={t('buttons.downloadOptions')}
                data-no-select
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                <span>{t('buttons.download')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
              <DropdownMenuItem onClick={handleDownloadHtml} className="dark:text-gray-200 dark:hover:bg-gray-700">
                <FileDown className="h-3.5 w-3.5 mr-2" />
                {t('buttons.downloadHtml')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadImage} className="dark:text-gray-200 dark:hover:bg-gray-700">
                <ImageDown className="h-3.5 w-3.5 mr-2" />
                {t('buttons.downloadImage')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handleClearStorage}
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            title={t('buttons.clearStorageTooltip')}
            data-no-select
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span>{t('buttons.clearStorage')}</span>
          </Button>
          <Button
            onClick={handleSaveHtml}
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            title={t('buttons.saveHtmlTooltip')}
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            <span>{t('buttons.saveHtml')}</span>
          </Button>
        </div>
        <Tabs value={activePreviewTab} onValueChange={(value: string) => setActivePreviewTab(value as "ppt" | "html")} >
             <TabsList className="h-7 dark:bg-gray-800 dark:border-gray-700" data-no-select>
               <TabsTrigger
                 value="ppt"
                 className="text-xs h-6 px-2 dark:text-gray-400 data-[state=active]:dark:text-white data-[state=active]:dark:bg-gray-700"
                 data-no-select
               >
                 {t('tabs.ppt')}
               </TabsTrigger>
               <TabsTrigger
                 value="html"
                 className="text-xs h-6 px-2 dark:text-gray-400 data-[state=active]:dark:text-white data-[state=active]:dark:bg-gray-700"
                 data-no-select
               >
                 {t('tabs.html')}
               </TabsTrigger>
             </TabsList>
          </Tabs>
      </div>

      <div
        ref={iframeContainerRef}
        className={`flex-grow w-full relative overflow-hidden ${isFullscreen ? 'fixed inset-0 z-[2147483646] bg-black p-0 m-0' : 'flex flex-col'}`}
      >
        {isFullscreen ? (
          <>
            <iframe
              ref={iframeRef}
              key={`iframe-${renderKey}-fullscreen`}
              srcDoc={localHtmlContent}
              title={t('iframeTitle')}
              className="w-full h-full border-0 absolute inset-0 z-10"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
            {isSelecting && (
              <div
                className="absolute inset-0 bg-blue-500/10 pointer-events-none z-20 border border-blue-500 animate-pulse"
                data-no-select
              >
                <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  {t('selectionModeActive')}
                </span>
              </div>
            )}
            
            <div className="fixed top-25 right-4 z-[2147483647] flex gap-2">
              <Button
                onClick={handleFullscreenSelect}
                variant="default"
                size="sm"
                className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-md dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                data-no-select
                title={t('buttons.selectElement')}
              >
                {t('buttons.selectElement')}
              </Button>
              <Button
                onClick={handleNativeFullscreen}
                variant="outline"
                size="sm"
                className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-md dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                data-no-select
                title={isNativeFullscreen ? t('buttons.exitNativeFullscreen') : t('buttons.nativeFullscreen')}
              >
                {isNativeFullscreen ? <Minimize className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleToggleFullscreen}
                variant="outline"
                size="sm"
                className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-md dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                data-no-select
                title={t('buttons.exitEditMode')}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>

            {showEditor && selectedElementPath && (
              <FriendlyEditor
                elementPath={selectedElementPath}
                iframeRef={iframeRef}
                position={editorPosition}
                originalClasses={originalClasses}
                onClose={handleCloseEditor}
                onApplyChanges={handleApplyChanges}
                className="z-[50] fixed"
                containerRef={iframeContainerRef}
              />
            )}
          </>
        ) : (
          <>
            {activePreviewTab === 'ppt' && (
              <div className="h-full flex flex-col">
                <div className="p-2 border-b flex justify-between items-center flex-shrink-0 dark:border-gray-700" data-no-select>
                  <div className="flex items-center gap-2 flex-grow mr-4">
                    <span className="text-sm font-medium whitespace-nowrap">{t('titleInputLabel')}</span>
                    <Input
                      type="text"
                      placeholder={t('titleInputPlaceholder')}
                      value={htmlTitle}
                      onChange={(e) => setHtmlTitle(e.target.value)}
                      className="h-8 text-sm flex-grow min-w-[150px] dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      data-no-select
                    />
                  </div>
                  <div className="flex-shrink-0 flex space-x-2">
                    {isSelecting ? (
                      <Button
                        onClick={handleCancelSelecting}
                        variant="destructive"
                        size="sm"
                        data-no-select
                      >
                        {t('buttons.cancelSelection')}
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleStartSelecting}
                          variant="default"
                          size="sm"
                          data-no-select
                        >
                          {t('buttons.selectElement')}
                        </Button>
                        <Button
                          onClick={handleNativeFullscreen}
                          variant="outline"
                          size="sm"
                          data-no-select
                          title={t('buttons.nativeFullscreen')}
                        >
                          <Fullscreen className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={handleToggleFullscreen}
                          variant="outline"
                          size="sm"
                          data-no-select
                          title={t('buttons.editMode')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-grow relative bg-gray-100 dark:bg-gray-800">
                  <iframe
                    ref={iframeRef}
                    key={`iframe-${renderKey}`}
                    srcDoc={localHtmlContent}
                    title={t('iframeTitle')}
                    className="w-full h-full border-0 relative z-10"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                  />
                  {isSelecting && (
                    <div
                      className="absolute inset-0 bg-blue-500/10 pointer-events-none z-0 border border-blue-500 animate-pulse"
                      data-no-select
                    >
                      <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        {t('selectionModeActive')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePreviewTab === 'html' && (
              <ScrollArea className="h-full w-full">
                <div className="p-4">
                  <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded p-4">
                    {localHtmlContent}
                  </pre>
                </div>
              </ScrollArea>
            )}
          </>
        )}
      </div>

      {!isFullscreen && showEditor && selectedElementPath && (
        <FriendlyEditor
          elementPath={selectedElementPath}
          iframeRef={iframeRef}
          position={editorPosition}
          originalClasses={originalClasses}
          onClose={handleCloseEditor}
          onApplyChanges={handleApplyChanges}
          className="z-[2147483647] fixed"
          containerRef={iframeContainerRef}
        />
      )}

      {processingFeedback && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded shadow-lg z-50 animate-pulse">
          {processingFeedback}
        </div>
      )}
    </>
  );
}

// --- Helper Functions (Copied & Potentially Modified for HtmlPreview) ---

// Helper function to ensure HTML has necessary styles linked
const getFullHtmlWithStyles = (html: string): string => {
  // Assume Tailwind styles are in globals.css at the root
  // Adjust this path if your project's CSS output is different
  // Use Tailwind CDN instead for broader compatibility in isolated iframe
  const tailwindScript = '<script src="https://cdn.tailwindcss.com"></script>';
  const fontAwesomeLink = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">';
  const googleFontsLink = '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">';
  const headContent = `\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  ${tailwindScript}\n  ${fontAwesomeLink}\n  ${googleFontsLink}\n`;

  // Dynamic content adaptation script
  const adaptationScript = `
<script>
// 在页面加载完成后运行内容适应脚本
window.addEventListener('DOMContentLoaded', () => {
  const slideContent = document.getElementById('slide-content');
  const contentWrapper = document.getElementById('content-wrapper');
  
  if (!slideContent || !contentWrapper) return;
  
  // 测量内容高度与容器高度的比例
  const contentHeight = contentWrapper.scrollHeight;
  const containerHeight = slideContent.clientHeight;
  const contentRatio = contentHeight / containerHeight;
  
  // 根据内容密度调整样式类
  if (contentRatio > 1.2) {
    // 内容较多，使用紧凑布局
    contentWrapper.classList.remove('p-4');
    contentWrapper.classList.add('p-2');
    
    // 标题使用较小字体
    document.querySelectorAll('h1').forEach(el => {
      el.classList.add('text-2xl', 'sm:text-3xl', 'my-1');
      el.classList.remove('text-3xl', 'sm:text-4xl', 'my-2');
    });
    
    document.querySelectorAll('h2').forEach(el => {
      el.classList.add('text-xl', 'sm:text-2xl', 'my-1');
      el.classList.remove('text-2xl', 'sm:text-3xl', 'my-2');
    });
    
    // 段落使用较紧凑间距
    document.querySelectorAll('p, ul, ol').forEach(el => {
      el.classList.add('my-1', 'text-sm', 'leading-tight');
      el.classList.remove('my-2', 'text-base', 'leading-relaxed');
    });
    
    // 列表项使用较紧凑间距
    document.querySelectorAll('li').forEach(el => {
      el.classList.add('mb-0.5');
      el.classList.remove('mb-1');
    });
  } 
  else if (contentRatio < 0.7) {
    // 内容较少，使用宽松布局
    contentWrapper.classList.remove('p-4');
    contentWrapper.classList.add('p-6', 'sm:p-8');
    
    // 标题使用较大字体
    document.querySelectorAll('h1').forEach(el => {
      el.classList.add('text-4xl', 'sm:text-5xl', 'my-4');
      el.classList.remove('text-3xl', 'sm:text-4xl', 'my-2');
    });
    
    document.querySelectorAll('h2').forEach(el => {
      el.classList.add('text-3xl', 'sm:text-4xl', 'my-3');
      el.classList.remove('text-2xl', 'sm:text-3xl', 'my-2');
    });
    
    // 段落使用较宽松间距
    document.querySelectorAll('p, ul, ol').forEach(el => {
      el.classList.add('my-3', 'text-lg', 'leading-relaxed');
      el.classList.remove('my-2', 'text-base', 'leading-normal');
    });
    
    // 列表项使用较宽松间距
    document.querySelectorAll('li').forEach(el => {
      el.classList.add('mb-2');
      el.classList.remove('mb-1');
    });
  } 
  else {
    // 中等内容量，使用默认布局（保持p-4，无需特殊调整）
    // 但我们仍然要确保所有元素都有正确的基础类
    
    // 标题使用默认字体大小
    document.querySelectorAll('h1').forEach(el => {
      if (!el.classList.contains('text-3xl')) {
        el.classList.add('text-3xl', 'sm:text-4xl', 'my-2');
      }
    });
    
    document.querySelectorAll('h2').forEach(el => {
      if (!el.classList.contains('text-2xl')) {
        el.classList.add('text-2xl', 'sm:text-3xl', 'my-2');
      }
    });
    
    // 段落使用默认间距
    document.querySelectorAll('p, ul, ol').forEach(el => {
      if (!el.classList.contains('my-2')) {
        el.classList.add('my-2', 'text-base', 'leading-normal');
      }
    });
    
    // 列表项使用默认间距
    document.querySelectorAll('li').forEach(el => {
      if (!el.classList.contains('mb-1')) {
        el.classList.add('mb-1');
      }
    });
  }
});
</script>
`;

  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const headElement = tempDiv.querySelector('head');
  const bodyElement = tempDiv.querySelector('body');

  // Check if it's a full document vs fragment
  const isFullDocument = html.trim().startsWith('<!DOCTYPE') || html.trim().startsWith('<html');
  const hasHead = !!headElement;
  const hasBody = !!bodyElement;

  if (isFullDocument) {
      if (hasHead) {
          // Inject styles into existing head
          let headHtml = headElement.innerHTML;
          if (!headHtml.includes('cdn.tailwindcss.com')) headHtml += tailwindScript;
          if (!headHtml.includes('font-awesome')) headHtml += fontAwesomeLink;
          if (!headHtml.includes('fonts.googleapis.com')) headHtml += googleFontsLink;
          headElement.innerHTML = headHtml; // Update head content
          
          // Inject script before closing body tag if body exists
          if (bodyElement) {
            bodyElement.innerHTML += adaptationScript;
          } else {
            // If no body tag but full doc, append script after potential head
            tempDiv.innerHTML += adaptationScript;
          }
          return tempDiv.innerHTML; // Return modified full HTML
      } else {
          // Add head if <html> exists but no <head>
          const htmlTag = tempDiv.querySelector('html');
          if (htmlTag) {
              const newHead = document.createElement('head');
              newHead.innerHTML = headContent;
              htmlTag.insertBefore(newHead, htmlTag.firstChild);
              
              // Inject script before closing body tag if body exists
              const bodyInHtml = htmlTag.querySelector('body');
              if (bodyInHtml) {
                bodyInHtml.innerHTML += adaptationScript;
              } else {
                // If no body tag, append script to html tag
                htmlTag.innerHTML += adaptationScript;
              }
              return tempDiv.innerHTML;
          }
      }
  } 

  // If it's a fragment or body content, wrap it completely and add script
  return `<!DOCTYPE html>\n<html>\n<head>${headContent}</head>\n<body>\n${html}\n${adaptationScript}\n</body>\n</html>`;
};