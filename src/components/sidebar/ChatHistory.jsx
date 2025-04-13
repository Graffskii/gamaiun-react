import React from 'react';
import { useAppContext } from '../../contexts/AppContext'; // Путь может отличаться

const ChatHistory = () => {
  const { chats, currentChat, selectChat, isLoadingChats } = useAppContext();

  if (isLoadingChats && chats.length === 0) {
    return <div className="p-2 text-gray-400 text-sm">Загрузка чатов...</div>;
  }

  if (!isLoadingChats && chats.length === 0) {
      return <div className="p-2 text-gray-400 text-sm">Нет доступных чатов.</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">История чатов</h3>
      <ul className="space-y-1">
        {chats.map((chat) => (
          <li key={chat.id}>
            <button
              onClick={() => selectChat(chat.id)}
              className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors duration-150 ${
                currentChat?.id === chat.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={chat.title} // Показываем полное название при наведении
            >
              <span className="truncate block">{chat.title || 'Без названия'}</span>
               {/* Можно добавить дату */}
               {/* <span className="text-xs text-gray-400 block">{new Date(chat.updatedAt).toLocaleDateString()}</span> */}
            </button>
          </li>
        ))}
         {isLoadingChats && chats.length > 0 && (
             <div className="p-2 text-gray-400 text-sm text-center">Обновление...</div>
         )}
      </ul>
    </div>
  );
};

export default ChatHistory;