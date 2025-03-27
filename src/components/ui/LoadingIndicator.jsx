import React from 'react';
import { motion } from 'framer-motion';

const LoadingIndicator = () => {
  const dotVariants = {
    initial: { opacity: 0.5, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1.2,
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2 p-4">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          className="w-3 h-3 bg-blue-500 rounded-full"
        />
      ))}
    </div>
  );
};

export default LoadingIndicator;