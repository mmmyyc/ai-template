'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

type TourButtonProps = {
  onClick: () => void;
};

const TourButton = ({ onClick }: TourButtonProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button 
      onClick={onClick}
      className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-30"
      aria-label="Start Tour"
      title="Need help? Take a tour!"
    >
      <HelpCircle size={20} />
    </button>
  );
};

export default TourButton; 