import React, { useContext, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import LoadingIndicator from '../ui/LoadingIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';

const ChatContainer = () => {
  const { currentChat, isLoading } = useAppContext();
  const containerRef = useRef(null);

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentChat.messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto chat-container p-4 space-y-4">
      <AnimatePresence>
        {currentChat.messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && <LoadingIndicator />}
      </AnimatePresence>
    </div>
  );
};

export default ChatContainer;