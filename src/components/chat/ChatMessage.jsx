import React from 'react';
import { motion } from 'framer-motion';

const ChatMessage = ({ message }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
    >
      <div 
        className={`
          inline-block 
          p-3 
          rounded-lg 
          max-w-[80%] 
          ${message.isUser 
            ? 'bg-blue-600 text-white ml-auto' 
            : 'bg-gray-700 text-white'}
        `}
      >
        {message.text && <p>{message.text}</p>}
        {message.items && (
          <ul className="list-disc list-inside">
            {message.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;