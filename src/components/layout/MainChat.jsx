import React from 'react';
import ChatContainer from '../chat/ChatContainer';
import ChatInput from '../chat/ChatInput';

const MainChat = () => {
  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-700">
        <div className="text-lg font-medium">Текущий диалог</div>
      </div>
      <ChatContainer />
      <ChatInput />
    </div>
  );
};

export default MainChat;