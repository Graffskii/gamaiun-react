import React from 'react';
import ChatContainer from '../chat/ChatContainer'; // Путь может отличаться
import ChatInput from '../chat/ChatInput'; // Путь может отличаться
import { useAppContext } from '../../contexts/AppContext'; // Путь может отличаться

const MainChat = () => {
  const { currentChat, isLoadingMessages, chatError } = useAppContext();

  // Сообщение, если чат не выбран
  if (!currentChat && !isLoadingMessages) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-gray-400 p-4">
             <i className="ri-chat-off-line text-4xl mb-4"></i>
              <p>Выберите чат из списка слева или создайте новый.</p>
          </div>
      );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Шапка чата */}
      <div className="p-4 border-b border-gray-700 h-16 flex items-center">
        {currentChat ? (
          <div className="text-lg font-medium text-white truncate" title={currentChat.title}>
            {currentChat.title || 'Чат'}
          </div>
        ) : (
           <div className="text-lg font-medium text-gray-500">Загрузка...</div>
        )}
      </div>

      {/* Контейнер сообщений */}
      <ChatContainer /> {/* ChatContainer сам обработает isLoadingMessages и messages */}

      {/* Поле ввода */}
      {/* Блокируем ввод, если чат не выбран или сообщения еще грузятся? Решать тебе */}
      <ChatInput disabled={!currentChat || isLoadingMessages} />
    </div>
  );
};

export default MainChat;