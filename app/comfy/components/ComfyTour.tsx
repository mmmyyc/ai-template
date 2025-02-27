'use client';

import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { usePathname } from 'next/navigation';

type ComfyTourProps = {
  run: boolean;
  setRun: (run: boolean) => void;
};

const ComfyTour = ({ run, setRun }: ComfyTourProps) => {
  const pathname = usePathname();
  const [steps, setSteps] = useState<Step[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 根据不同页面设置不同的步骤
    if (pathname === '/comfy/image-generation') {
      setSteps([
        {
          target: 'body',
          content: 'Welcome to YCamie Desktop Pet Generator! Let us show you around.',
          placement: 'center',
          disableBeacon: true,
        },
        {
          target: '.drawer-side',
          content: 'This is the navigation menu. You can easily access different features here.',
          placement: 'right',
        },
        {
          target: 'textarea',
          content: 'Describe your desktop pet here. Keep descriptions concise and focused. Currently, we only support character-based shimejis!',
          placement: 'bottom',
        },
        {
          target: '.image-upload-area',
          content: 'You can also upload a reference image to guide the AI in creating your pet.',
          placement: 'top',
        },
        {
          target: '.generate-pet-btn',
          content: 'Click here to generate your unique desktop pet!',
          placement: 'bottom',
        },
        {
          target: '.daily-limit',
          content: 'Keep track of your remaining daily generations here.',
          placement: 'top',
        },
        {
          target: 'body',
          content: 'Note: The current model may not maintain perfect consistency. If your character has issues, try using better prompts or reference images.',
          placement: 'center',
        }
      ]);
    } else if (pathname === '/comfy/history') {
      setSteps([
        {
          target: 'body',
          content: 'This is your generation history. All your previous creations are stored here.',
          placement: 'center',
          disableBeacon: true,
        },
        {
            target: '.prompt-text',
            content: 'Here is the prompt used for this generation.',
            placement: 'top',
        },
        {
            target: '.download-btn',
            content: 'Click here to download your pet image.',
            placement: 'auto',
        }
      ]);
    }
  }, [pathname]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      // 保存用户已完成引导的信息到localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('comfyTourComplete', 'true');
      }
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#3b82f6', // 蓝色主题
        },
        buttonBack: {
          marginRight: 10,
        }
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip'
      }}
    />
  );
};

export default ComfyTour; 