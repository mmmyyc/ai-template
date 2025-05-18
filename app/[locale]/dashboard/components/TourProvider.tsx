'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import TourButton from './TourButton';

// 动态导入 ComfyTour 组件，禁用SSR
const ComfyTour = dynamic(() => import('./ComfyTour'), { 
  ssr: false 
});

type TourProviderProps = {
  children: React.ReactNode;
};

const TourProvider = ({ children }: TourProviderProps) => {
  const [runTour, setRunTour] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // 检查用户是否是第一次访问
    // 注意：我们不再在页面加载时自动启动引导
    const tourComplete = localStorage.getItem('comfyTourComplete');
    if (!tourComplete) {
      setIsFirstVisit(true);
      // 如果是第一次访问，仍然设置标志，但不自动启动引导
      // setRunTour(true); // 这行被注释掉，不再自动启动
    }
  }, []);

  // 监听自定义事件以启动引导
  useEffect(() => {
    const handleStartTourEvent = () => {
      localStorage.removeItem('comfyTourComplete');
      setRunTour(true);
    };

    window.addEventListener('startComfyTour', handleStartTourEvent);
    return () => {
      window.removeEventListener('startComfyTour', handleStartTourEvent);
    };
  }, []);

  const handleStartTour = () => {
    // 用户点击按钮时启动引导
    // 先移除本地存储标记，使其表现为"新"引导
    localStorage.removeItem('comfyTourComplete');
    
    // 重要：先设置为false，然后在下一个事件循环中设置为true
    // 这样可以确保每次点击都能重新触发引导
    setRunTour(false);
    setTimeout(() => {
      setRunTour(true);
    }, 50);
  };

  // 只在客户端渲染
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <ComfyTour run={runTour} setRun={setRunTour} />
      <TourButton onClick={handleStartTour} />
    </>
  );
};

export default TourProvider; 