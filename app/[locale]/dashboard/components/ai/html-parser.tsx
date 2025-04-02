"use client";

import React, { useRef, useState, useEffect } from 'react';
import parse, { HTMLReactParserOptions, Element, domToReact, DOMNode } from 'html-react-parser';
import { extendStringPrototype, generateElementId } from '@/app/[locale]/dashboard/utils/stringUtils';

// 确保String原型有hashCode方法
declare global {
  interface String {
    hashCode(): string;
  }
}

// 初始化时扩展String原型
extendStringPrototype();

interface HtmlParserProps {
  htmlContent: string;
  isSelecting: boolean;
  onElementSelect?: (element: HTMLElement) => void;
  contentContainerRef: React.RefObject<HTMLDivElement>;
  onMouseOver?: (target: HTMLElement) => void;
  onMouseOut?: (target: HTMLElement) => void;
}

export default function HtmlParser({
  htmlContent,
  isSelecting,
  onElementSelect,
  contentContainerRef,
  onMouseOver,
  onMouseOut
}: HtmlParserProps) {
  const elementIdCounter = useRef(0);
  
  // 确保客户端初始化
  useEffect(() => {
    extendStringPrototype();
  }, []);

  // 解析HTML并为每个元素添加唯一标识
  const parseHtml = () => {
    elementIdCounter.current = 0;

    try {
      const wrappedHtml = `<div class="html-content">${htmlContent}</div>`;
      
      const options: HTMLReactParserOptions = {
        replace: (domNode) => {
          if (domNode.type === 'tag' && domNode instanceof Element) {
            const element = domNode;
            const index = elementIdCounter.current++;
            
            // 使用辅助函数生成一致的ID
            const uid = generateElementId(
              element.name,
              element.attribs?.class,
              // 只获取第一个文本子节点的内容用于ID生成
              element.children?.[0]?.type === 'text' ? element.children[0].data?.substring(0, 10) : undefined,
              index
            );
            
            // 为每个元素添加一个数据属性作为唯一标识
            const props = {
              'data-element-id': uid,
              ...element.attribs,
            };
            
            // 递归处理子元素
            const children = domToReact(element.children as DOMNode[], options);
            
            // 创建React元素
            return React.createElement(
              element.name,
              props,
              children
            );
          }
          return undefined;
        }
      };
      
      return parse(wrappedHtml, options);
    } catch (error) {
      console.error("HTML解析错误:", error);
      return <div className="text-red-500">HTML解析错误: {String(error)}</div>;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isSelecting || !onElementSelect) return;
    
    const target = e.target as HTMLElement;
    
    // 忽略容器本身或带有no-select属性的元素
    if (target.classList.contains('content-container') ||
        target.hasAttribute('data-no-select') || 
        target.closest('[data-no-select]')) {
      return;
    }
    
    // 记录点击元素信息用于调试
    console.log('点击元素:', {
      tagName: target.tagName,
      className: target.className,
      elementId: target.getAttribute('data-element-id'),
      text: target.innerText?.substring(0, 20)
    });
    
    // 阻止事件冒泡
    e.stopPropagation();
    
    // 将元素传递给父组件处理
    onElementSelect(target);
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    
    const target = e.target as HTMLElement;
    if (!target.classList.contains('content-container') && 
        !target.hasAttribute('data-no-select') && 
        !target.closest('[data-no-select]')) {
      target.style.outline = '2px dashed #3b82f6';
      
      // 显示额外的选择提示
      if (target.getAttribute('data-element-id')) {
        target.style.cursor = 'pointer';
      }
      
      if (onMouseOver) onMouseOver(target);
    }
  };

  const handleMouseOut = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    
    const target = e.target as HTMLElement;
    if (!target.classList.contains('content-container')) {
      target.style.outline = '';
      target.style.cursor = '';
      
      if (onMouseOut) onMouseOut(target);
    }
  };

  return (
    <div 
      className="content-container w-full overflow-hidden" 
      style={{ maxWidth: '100%', position: 'relative' }}
      data-content-container="true"
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {parseHtml()}
    </div>
  );
} 