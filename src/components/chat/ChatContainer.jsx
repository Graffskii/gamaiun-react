import React, { useContext, useEffect, useRef } from 'react';
import { AppContext } from '../../contexts/AppContext';
import ChatMessage from './ChatMessage';

const ChatContainer = () => {
  const { messages } = useContext(AppContext);
  const containerRef = useRef(null);

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto chat-container p-4 space-y-4">
      {messages.map(message => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
};

export default ChatContainer;