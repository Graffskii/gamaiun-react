// src/components/layout/MainChat.jsx
import React from 'react';
import ChatContainer from '../chat/ChatContainer';
import ChatInput from '../chat/ChatInput';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext'; // Импортируем useAuth

const MainChat = () => {
  const { currentChat, isLoadingMessages } = useAppContext();
  const { user } = useAuth(); // Получаем текущего пользователя

  // --- Логика отображения контента в зависимости от статуса пользователя ---
  let content;

  if (!user) { // Пользователь еще не загружен (маловероятно, если AuthProvider выше)
    content = (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-gray-400 p-4">
        <i className="ri-loader-4-line animate-spin text-4xl mb-4"></i>
        <p>Загрузка данных пользователя...</p>
      </div>
    );
  } else if (user.role === 'USER' || (user.role === 'VERIFIED_USER' && !user.companyId)) {
    // Пользователь с ролью USER или VERIFIED_USER, но БЕЗ назначенной компании
    content = (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-gray-300 p-6 text-center">
        <i className="ri-shield-user-line text-6xl mb-6 text-primary"></i>
        <h2 className="text-2xl font-semibold mb-3">Ожидание активации</h2>
        <p className="max-w-md mb-2">
          Ваша учетная запись зарегистрирована. Для получения полного доступа к функциям приложения, включая чат с AI и просмотр документов,
          администратор должен подтвердить вашу учетную запись и назначить вас в соответствующую компанию.
        </p>
        <p className="text-sm text-gray-500">
          Пожалуйста, ожидайте или свяжитесь с администратором вашей организации.
        </p>
      </div>
    );
  } else if (!currentChat && !isLoadingMessages) {
    // Проверенный пользователь с компанией, но чат не выбран
    content = (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-gray-400 p-4">
        <i className="ri-chat-off-line text-4xl mb-4"></i>
        <p>Выберите чат из списка слева или создайте новый.</p>
      </div>
    );
  } else {
    // Чат выбран, показываем его
    content = (
      <>
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
        <ChatContainer />
        {/* Поле ввода */}
        <ChatInput disabled={!currentChat || isLoadingMessages} />
      </>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {content}
    </div>
  );
};

export default MainChat;