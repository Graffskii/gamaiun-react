import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

const ChatHistory = () => {
  const { chatHistory } = useContext(AppContext);

  const handleChatSelect = (chatId) => {
    console.log('Selected chat:', chatId);
    // Здесь будет логика загрузки диалога
  };

  return (
    <div className="mb-4">
      <div className="text-sm text-gray-400 mb-2">История диалогов</div>
      <div className="space-y-2">
        {chatHistory.map(chat => (
          <div 
            key={chat.id}
            className="text-sm cursor-pointer hover:bg-gray-700 p-2 rounded"
            onClick={() => handleChatSelect(chat.id)}
          >
            <div className="font-medium">{chat.title}</div>
            <div className="text-xs text-gray-400">{chat.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;