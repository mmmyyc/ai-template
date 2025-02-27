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
    const tourComplete = localStorage.getItem('comfyTourComplete');
    if (!tourComplete) {
      setIsFirstVisit(true);
      // 稍微延迟启动引导，确保页面完全加载
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
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
    // 启动引导时，移除本地存储标记，使其表现为"新"引导
    localStorage.removeItem('comfyTourComplete');
    setRunTour(true);
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