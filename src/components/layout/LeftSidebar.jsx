import React, { useState } from 'react';
import SourceList from '../sidebar/SourceList';
import ChatHistory from '../sidebar/ChatHistory';

const LeftSidebar = () => {
  const [expandedSource, setExpandedSource] = useState(null);

  const handleCreateNewChat = () => {
    console.log('Creating new chat');
    // Здесь будет логика создания нового чата
  };

  return (
    <div className="w-64 bg-[#1E293B] border-r border-gray-700 flex flex-col">
      <div className="p-4">
        <div className="font-['Pacifico'] text-2xl text-primary mb-6">GamAIun</div>
        <button
          onClick={handleCreateNewChat}
          className="w-full bg-primary hover:bg-blue-600 text-white rounded-button py-2 px-4 flex items-center justify-center gap-2 mb-6"
        >
          <i className="ri-add-line"></i>
          <span>Новый чат</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4">
          <SourceList expandedSource={expandedSource} setExpandedSource={setExpandedSource} />
          <ChatHistory />
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;