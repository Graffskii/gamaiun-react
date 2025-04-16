import React from 'react';
import { useAppContext } from '../../contexts/AppContext'; // Путь может отличаться

const ChatHistory = () => {
  const { chats, currentChat, selectChat, isLoadingChats, deleteChat, isDeletingChat } = useAppContext();

  // --- Обработчик клика по кнопке удаления ---
  const handleDeleteClick = async (e, chatToDelete) => {
    e.stopPropagation(); // Важно: остановить всплытие, чтобы не сработал selectChat

    // Задаем вопрос пользователю
    // Используем имя чата для ясности
    const chatTitle = chatToDelete.title || `Чат ID ${chatToDelete.id}`;
    const confirmation = window.confirm(`Вы уверены, что хотите удалить чат "${chatTitle}"? Это действие необратимо.`);

    if (confirmation) {
        console.log(`Attempting to delete chat: ${chatToDelete.id}`);
        try {
            // Вызываем функцию удаления из контекста
            await deleteChat(chatToDelete.id);
            // Сообщение об успехе не нужно, UI обновится сам
        } catch (error) {
            // Ошибка уже обработана в AppContext (установлен chatError)
            // Можно показать alert здесь, если нужно дублировать
            alert(`Не удалось удалить чат: ${error.message}`);
        }
    } else {
        console.log(`Deletion cancelled for chat: ${chatToDelete.id}`);
    }
  };

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
          <li key={chat.id} className="group relative">
            <button
              onClick={() => selectChat(chat.id)}
              className={`w-full text-left px-2 pr-8 py-1.5 rounded-md text-sm transition-colors duration-150 relative ${
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

            {/* --- Кнопка удаления --- */}
            <button
                onClick={(e) => handleDeleteClick(e, chat)}
                disabled={isDeletingChat} // Блокируем кнопку во время ЛЮБОГО удаления
                className={`absolute right-1 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-gray-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 disabled:opacity-30 disabled:cursor-not-allowed`}
                aria-label={`Удалить чат ${chat.title || ''}`}
                title="Удалить чат"
            >
                {/* Иконка корзины */}
                <i className="ri-delete-bin-line"></i>
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