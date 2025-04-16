import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext'; // Путь может отличаться
import LoadingIndicator from '../ui/LoadingIndicator'; // Путь может отличаться
import ChatMessage from './ChatMessage'; // Путь может отличаться
import { AnimatePresence } from 'framer-motion';

const ChatContainer = () => {
  // Берем сообщения, флаги загрузки и ошибки из контекста
  const { messages, isLoadingMessages, isSendingMessage, chatError, currentChat } = useAppContext();
  const containerRef = useRef(null);
  const bottomRef = useRef(null); // Реф для скролла к последнему сообщению

  // Автоскролл вниз при новых сообщениях или при первой загрузке
  useEffect(() => {
    // Скроллим к самому низу, когда сообщения загрузились или добавилось новое
    if (bottomRef.current) {
       bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        // Альтернатива: containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]); // Зависимость от массива сообщений


  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto chat-container p-4 space-y-4 relative">
        {/* Показываем индикатор загрузки по центру, если грузятся сообщения и их еще нет */}
        {isLoadingMessages && messages.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
                <LoadingIndicator text="Загрузка сообщений..." />
            </div>
        )}

         {/* Отображаем ошибку загрузки сообщений */}
         {chatError && messages.length === 0 && !isLoadingMessages && (
             <div className="text-center text-red-400 mt-10">
                 <i className="ri-error-warning-line text-3xl mb-2"></i>
                 <p>Ошибка: {chatError}</p>
             </div>
         )}

        {/* Анимация появления сообщений */}
      <AnimatePresence>
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} chatId={currentChat?.id} />
        ))}
      </AnimatePresence>

        {/* Показываем индикатор отправки (можно убрать, если статус показывается в ChatMessage) */}
        {/* {isSendingMessage && <LoadingIndicator size="small" text="Отправка..." />} */}

       {/* Пустой div в конце для автоскролла */}
       <div ref={bottomRef} style={{ height: '1px' }} />
    </div>
  );
};

export default ChatContainer;