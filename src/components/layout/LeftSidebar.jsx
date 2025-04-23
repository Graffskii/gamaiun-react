import React, { useState } from 'react';
// import SourceList from '../sidebar/SourceList';
import FileTree from '../drive/FileTree';
import ChatHistory from '../sidebar/ChatHistory';
import { useAppContext } from '../../contexts/AppContext';

const LeftSidebar = () => {
  // const [expandedSource, setExpandedSource] = useState(null);
  const {
    createNewChat,
    driveItemsTree, // Получаем дерево
    isLoadingDriveItems, // Получаем статус загрузки
    driveItemsError // Получаем ошибку
} = useAppContext();

  const handleCreateNewChat = () => {
    createNewChat();
  };

  return (
    <div className="w-64 bg-[#1E293B] border-r border-gray-700 flex flex-col h-full"> {/* Добавил h-full */}
      <div className="p-4 flex-shrink-0"> {/* Заголовок и кнопка не скроллятся */}
        <div className="font-['Pacifico'] text-2xl text-primary mb-6 text-center">GamAIun</div>
        <button
          onClick={handleCreateNewChat}
          className="w-full bg-primary hover:bg-blue-600 text-white rounded-button py-2 px-4 flex items-center justify-center gap-2 mb-6 text-sm"
        >
          <i className="ri-add-line"></i>
          <span>Новый чат</span>
        </button>
      </div>

      {/* Разделитель */}
       <div className="border-t border-gray-700 mx-4 mb-2"></div>

      {/* Скроллящаяся область */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4"> {/* Добавил px-2 и space-y */}

        {/* Секция для файлов Google Drive */}
        <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Источники (Диск)</h3>
             {isLoadingDriveItems && <div className="px-2 text-sm text-gray-400">Загрузка файлов...</div>}
             {driveItemsError && <div className="px-2 text-sm text-red-400">Ошибка: {driveItemsError}</div>}
             {!isLoadingDriveItems && !driveItemsError && (
                 driveItemsTree.length > 0
                    ? <FileTree items={driveItemsTree} />
                    : <div className="px-2 text-sm text-gray-400">Файлы не найдены. Запустите синхронизацию.</div>
             )}
        </div>

         {/* Разделитель */}
         <div className="border-t border-gray-700 my-2"></div>

        {/* Секция истории чатов */}
        <ChatHistory />

        {/* Убираем старый SourceList, если он не нужен */}
        {/* <SourceList expandedSource={expandedSource} setExpandedSource={setExpandedSource} /> */}
      </div>
    </div>
  );
};

export default LeftSidebar;