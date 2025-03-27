import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

const ChatHistory = () => {
  const { chats, currentChat, setCurrentChat } = useAppContext();

  const handleChatSelect = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <div className="mt-4">
      <h3 className="text-gray-400 text-sm mb-2">История чатов</h3>
      {chats.map(chat => (
        <div 
          key={chat.id} 
          onClick={() => handleChatSelect(chat)}
          className={`
            p-2 rounded-lg cursor-pointer mb-2 
            ${currentChat?.id === chat.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}
          `}
        >
          {chat.title}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;