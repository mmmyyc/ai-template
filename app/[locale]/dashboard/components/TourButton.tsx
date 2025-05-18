'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

type TourButtonProps = {
  onClick: () => void;
};

const TourButton = ({ onClick }: TourButtonProps) => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 设置自动隐藏的时间（毫秒）
  const autoHideDelay = 3000;
  
  // 启动自动隐藏计时器
  const startHideTimer = () => {
    // 先清除已有的计时器
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    // 设置新计时器
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, autoHideDelay);
  };
  
  // 清除自动隐藏计时器
  const clearHideTimer = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  // 显示按钮并重置计时器
  const showButton = () => {
    setIsVisible(true);
    clearHideTimer();
  };
  
  // 组件挂载和卸载时的处理
  useEffect(() => {
    setMounted(true);
    
    // 组件卸载时清除计时器
    return () => {
      clearHideTimer();
    };
  }, []);

  // 处理按钮点击
  const handleClick = () => {
    onClick();
    // 点击后重置计时器
    startHideTimer();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-8 right-0 z-30 overflow-visible"
      onMouseEnter={showButton}
      onMouseLeave={startHideTimer}
    >
      <div 
        className={`
          w-10 h-10 rounded-full 
          ${isVisible ? 'bg-blue-500 translate-x-0' : 'bg-blue-400/50 translate-x-6'} 
          transition-all duration-300 ease-in-out cursor-pointer
          flex items-center justify-center shadow-lg
          hover:bg-blue-600
        `}
        onClick={handleClick}
        aria-label="Start Tour"
        title="Need help? Take a tour!"
      >
        <HelpCircle 
          size={20} 
          className={`text-white transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-60'}`} 
        />
      </div>
    </div>
  );
};

export default TourButton; 