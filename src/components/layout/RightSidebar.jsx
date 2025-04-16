// RightSidebar.jsx
import React from 'react';
import UserProfile from '../sidebar/UserProfile';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

const RightSidebar = () => {
  const {
    toggleSupportModal,
    currentChat, // Получаем текущий чат
    messages,    // Получаем сообщения текущего чата
    chatMode,    // Получаем текущий режим
    chats        // Получаем список всех чатов
  } = useAppContext();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Функция для форматирования даты (можно вынести в утилиты)
  const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
          return new Date(dateString).toLocaleString('ru-RU', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          });
      } catch (e) {
          return 'Invalid Date';
      }
  };

  const totalChats = chats.length;
  // Подсчет общего количества запросов (пар сообщений user+ai) - примерный подсчет
  // Лучше получать эту статистику с бэкенда, если она важна
  // const totalRequests = chats.reduce((sum, chat) => sum + Math.floor((chat.messages?.length || 0) / 2), 0);
  const totalRequests = 'N/A'; // Пока заглушка, лучше считать на бэке

  return (
    <div className="w-64 bg-[#1E293B] border-l border-gray-700 flex flex-col h-full text-sm">
      {/* Основной контент */}
      <div className="p-4 flex-grow overflow-y-auto space-y-6">
        {/* Профиль пользователя */}
        <UserProfile />

        {/* Информация о текущем чате (если выбран) */}
        {currentChat && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Текущий чат</h3>
            <div className="bg-gray-800 p-3 rounded-lg space-y-2 text-gray-300">
              <div className='overflow-hidden'>
                  <span className="font-medium text-white block truncate" title={currentChat.title || 'Без названия'}>
                      {currentChat.title || 'Без названия'}
                  </span>
              </div>
               <div>
                <span className="text-gray-400">Создан:</span> {formatDate(currentChat.createdAt)}
              </div>
              <div>
                <span className="text-gray-400">Активность:</span> {formatDate(currentChat.updatedAt)}
              </div>
              <div>
                <span className="text-gray-400">Сообщений:</span> {messages.length > 0 ? messages.length : '(загрузка...)'}
              </div>
               {/* Можно добавить сюда экспорт, переименование и т.д. */}
               {/*
               <button className="mt-2 text-xs text-blue-400 hover:underline">Экспорт чата</button>
               */}
            </div>
          </div>
        )}

        {/* Общая информация и статистика */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Информация</h3>
          <div className="bg-gray-800 p-3 rounded-lg space-y-2 text-gray-300">
            <div>
                <span className="text-gray-400">Режим AI:</span>
                <span className={`ml-1 font-medium ${chatMode === 'rag' ? 'text-purple-400' : 'text-cyan-400'}`}>
                    {chatMode === 'rag' ? 'RAG' : 'Gen'}
                </span>
                <span className="text-gray-500 text-xs ml-1">({chatMode === 'rag' ? 'Поиск по документам' : 'Общая генерация'})</span>
            </div>
            <div>
                <span className="text-gray-400">Всего чатов:</span> {totalChats}
            </div>
            {/* <div>
                <span className="text-gray-400">Всего запросов:</span> {totalRequests}
            </div> */}
            {/* Можно добавить ссылку на FAQ */}
            {/* <a href="/faq" className="mt-1 text-xs text-blue-400 hover:underline block">Помощь и FAQ</a> */}
          </div>
        </div>

        {/* Убираем блок "Активность" и "Активные источники" */}

      </div>

      {/* Нижняя часть с кнопками */}
      <div className="p-4 border-t border-gray-700 mt-auto space-y-3">
        <button
          onClick={toggleSupportModal}
          className="w-full bg-primary hover:bg-blue-600 text-white rounded-button py-2 px-4 flex items-center justify-center gap-2 text-sm"
        >
          <i className="ri-customer-service-line"></i>
          <span>Поддержка</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full bg-gray-600 hover:bg-red-700 text-white rounded-button py-2 px-4 flex items-center justify-center gap-2 transition-colors duration-200 text-sm"
        >
          <i className="ri-logout-box-r-line"></i>
          <span>Выйти</span>
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;