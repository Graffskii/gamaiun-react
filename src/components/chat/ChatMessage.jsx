import React from 'react';
import { motion } from 'framer-motion';

const ChatMessage = ({ message }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15,
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      layout // Анимируем изменение позиции при добавлении новых сообщений
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden" // Можно добавить анимацию удаления, если понадобится
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-2 animate-message-in`}
    >
      <div
        className={`
          relative // Для позиционирования статуса
          p-3 rounded-lg max-w-[80%] shadow-md
          ${message.isUser
            ? 'bg-blue-600 text-white ml-auto rounded-br-none' // Слегка ассиметричный для хвоста
            : 'bg-gray-700 text-white mr-auto rounded-bl-none'} // Слегка ассиметричный для хвоста
        `}
      >
        {/* Отображение текста или списка */}
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>} {/* Сохраняем переносы строк */}
        {message.items && (
          <ul className="list-disc list-inside mt-1">
            {message.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}

        {/* Отображение метаданных (списка файлов) */}
        {message.metadata && Array.isArray(message.metadata) && message.metadata.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-500 border-opacity-50">
                <h4 className="text-xs font-semibold mb-1 text-gray-300">Найденные источники:</h4>
                <ul className="space-y-1">
                    {message.metadata.map((file, index) => (
                        <li key={index} className="text-sm">
                            <a
                                href={file.file_path}
                                target="_blank" // Открывать в новой вкладке
                                rel="noopener noreferrer" // Для безопасности
                                className="inline-flex items-center text-blue-300 hover:text-blue-200 hover:underline"
                                title={file.file_path} // Показываем путь при наведении
                            >
                                <i className="ri-external-link-line text-xs mr-1"></i> {/* Иконка ссылки */}
                                <span className="truncate">{file.file_name || 'Источник без имени'}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}

         {/* Отображение статуса для сообщений пользователя */}
         {message.isUser && message.status && (
            <span className="absolute -bottom-4 right-1 text-xs text-gray-500 italic">
                {message.status === 'sending' && 'Отправка...'}
                {message.status === 'error' && (
                    <span className="text-red-400" title="Не удалось отправить">Ошибка</span>
                )}
                 {/* Статус 'sent' можно не показывать, или показывать галочку */}
                 {/* {message.status === 'sent' && <i className="ri-check-line"></i>} */}
            </span>
         )}

         {/* TODO: Отображение времени (по наведению или под сообщением) */}
         {/* <span className="text-xs text-gray-400 mt-1 block text-right">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> */}
      </div>
    </motion.div>
  );
};

export default ChatMessage;