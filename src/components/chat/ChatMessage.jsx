import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext'; // Путь может отличаться
import FeedbackModal from '../modals/FeedbackModal'; // Путь к модальному окну

const ChatMessage = ({ message, chatId }) => {
  const { submitFeedback, generateFromFileClick } = useAppContext(); // Получаем функцию из контекста
  const [isHovering, setIsHovering] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false); // Локальный статус загрузки фидбека

  

  // Обработчики наведения мыши
  const handleMouseEnter = () => !message.isUser && setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  // Определяем, есть ли уже фидбек (пришел с сервера или был установлен оптимистично)
  const hasFeedback = !!message.feedbackStatus;

  const handleFileLinkClick = (e, fileInfo) => {
    e.preventDefault(); // Предотвращаем стандартный переход по ссылке
    console.log('File link clicked:', fileInfo);
    if (generateFromFileClick) {
        // Вызываем новую функцию из контекста, передавая ID текущего AI сообщения и инфо о файле
        generateFromFileClick(message.id, fileInfo);
    } else {
        console.warn('generateFromFileClick function is not available in context');
    }
  };

  // --- Обработчики кликов по иконкам фидбека ---
  const handleFeedbackClick = useCallback(async (rating) => {
      // if (isSubmittingFeedback || message.feedbackStatus === rating) return; // Не отправлять повторно или во время отправки

      // Предотвращаем действие, если фидбек уже оставлен ИЛИ идет отправка
      if (hasFeedback || isSubmittingFeedback) return;
      
      try {
          if (rating === 'like') {
              setIsSubmittingFeedback(true);
              await submitFeedback(message.id, 'like', null, chatId);
              // Статус обновится через AppContext -> setMessages
          } else if (rating === 'dislike') {
              // Для дизлайка мы сначала просто помечаем его локально (визуально)
              // и открываем модальное окно. Отправка будет из модального окна.
              // НО! Мы можем сразу оптимистично показать дизлайк
              // submitFeedback('dislike') будет вызван из модалки
               setShowFeedbackModal(true);
               // Можно сразу вызвать updateMessageFeedbackStatus здесь, но лучше после отправки из модалки
          }
      } catch (error) {
          console.error(`Failed to handle ${rating} click:`, error);
          // Ошибка будет показана через chatError в AppContext
      } finally {
         // Сбрасываем локальный флаг загрузки только для лайка,
         // т.к. для дизлайка загрузка идет в модальном окне
         if (rating === 'like') {
             setIsSubmittingFeedback(false);
         }
      }
  }, [submitFeedback, message.id, hasFeedback, isSubmittingFeedback, chatId]);


  // --- Обработчик отправки из модального окна ---
   const handleModalSubmit = useCallback(async (comment) => {
        // Проверка hasFeedback нужна и здесь, на случай если статус обновился пока модалка была открыта
        if (hasFeedback || isSubmittingFeedback) return;
        console.log('ChatMessage: handleModalSubmit called with comment:', comment); // <--- ДОБАВЬ ЭТОТ ЛОГ
        // Здесь isSubmittingFeedback будет управляться внутри модального окна,
        // но мы можем использовать его для блокировки повторного открытия
        console.log('isSubmittingFeedback: ', isSubmittingFeedback); // <--- ДОБАВЬ ЭТОТ ЛОГ
        if (isSubmittingFeedback) return;
        setIsSubmittingFeedback(true); // Ставим флаг на время отправки из модалки
        try {
            // Отправляем 'dislike' с комментарием
            await submitFeedback(message.id, 'dislike', comment, chatId);
            // Статус 'dislike' обновится через AppContext -> setMessages
             setShowFeedbackModal(false); // Закрываем модалку при успехе (управляется из модалки, но на всякий случай)
        } catch (error) {
             console.error(`Failed to submit dislike feedback from modal:`, error);
             // Ошибка будет показана через chatError в AppContext
             // и может быть показана в модальном окне
             // НЕ закрываем модалку при ошибке, чтобы пользователь мог попробовать снова
             throw error; // Перебросить ошибку, чтобы модалка показала alert
        } finally {
             setIsSubmittingFeedback(false); // Сбрасываем флаг
        }
   }, [submitFeedback, message.id, hasFeedback, isSubmittingFeedback, chatId]);


  // Определяем, какие иконки показывать (закрашенные или нет)
  const isLiked = message.feedbackStatus === 'like';
  const isDisliked = message.feedbackStatus === 'dislike';


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
    <>
      <motion.div
        layout // Анимируем изменение позиции при добавлении новых сообщений
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden" // Можно добавить анимацию удаления, если понадобится
        className={`group relative flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4 animate-message-in`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`
            relative // Для позиционирования статуса
            p-3 rounded-lg max-w-[80%] shadow-md
            ${message.isUser
              ? 'bg-blue-600 text-white ml-auto rounded-br-none' // Слегка ассиметричный для хвоста
              : 'bg-gray-700 text-white mr-auto rounded-bl-none'} // Слегка ассиметричный для хвоста
            ${!message.isUser ? 'pb-8' : ''} // Добавляем отступ снизу при наведении для иконок
          `}
        >
          {/* Отображение текста или списка */}
          {message.text && <p className="whitespace-pre-wrap">{message.text}</p>} {/* Сохраняем переносы строк */}
          {/* {message.items && (
            <ul className="list-disc list-inside mt-1">
              {message.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )} */}

          {/* Отображение метаданных (списка файлов) */}
          {message.metadata?.results && Array.isArray(message.metadata.results) && message.metadata.results.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-500 border-opacity-50">
                  <h4 className="text-xs font-semibold mb-1 text-gray-300">Найденные источники:</h4>
                  <ul className="space-y-1">
                      {message.metadata.results.map((file, index) => (
                          <li key={index} className="text-sm">
                              <a
                                href={file.file_path || '#'} // Используем реальный путь или заглушку
                                onClick={(e) => handleFileLinkClick(e, { file_name: file.file_name, file_path: file.file_path })}
                                className="inline-flex items-center text-blue-300 hover:text-blue-200 hover:underline cursor-pointer" // Добавили cursor-pointer
                                title={`Запросить подробности по файлу: ${file.file_name}`}
                              >
                                <i className="ri-file-text-line text-xs mr-1"></i> {/* Иконка файла */}
                                <span className="truncate">{file.file_name || 'Источник без имени'}</span>
                                {/* Можно оставить иконку внешней ссылки, если путь валидный */}
                                {/* {file.file_path && <i className="ri-external-link-line text-xs ml-1 opacity-70"></i>} */}
                              </a>
                          </li>
                      ))}
                  </ul>
                  {/* Сообщение-подсказка */}
                  <p className="text-xs text-gray-400 italic mt-2">
                      Нажмите на файл для получения подробного ответа по нему.
                  </p>
              </div>
          )}

          {/* --- Иконки фидбека (только для AI сообщений) --- */}
          {!message.isUser && (
              <div
                className={`absolute bottom-1 right-1 flex gap-1 transition-opacity duration-200 ${
                  isHovering || isLiked || isDisliked // Показываем если наведено или уже есть фидбек
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100' // Появляются при наведении на родителя (group)
                }`}
              >
                <button
                  onClick={() => handleFeedbackClick('like')}
                  disabled={isSubmittingFeedback || hasFeedback} // Блокируем лайк если дизлайкнуто или идет отправка
                  className={`p-1 rounded text-gray-400 hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${isLiked ? 'text-green-400 bg-gray-600' : ''}`}
                  title={isLiked ? "Вам понравилось это сообщение" : "Нравится"}
                >
                  {isLiked ? <i className="ri-thumb-up-fill"></i> : <i className="ri-thumb-up-line"></i>}
                </button>
                <button
                  onClick={() => handleFeedbackClick('dislike')}
                  disabled={isSubmittingFeedback || hasFeedback} // Блокируем дизлайк если лайкнуто или идет отправка
                  className={`p-1 rounded text-gray-400 hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${isDisliked ? 'text-red-400 bg-gray-600' : ''}`}
                  title={isDisliked ? "Вам не понравилось это сообщение" : "Не нравится"}
                >
                  {isDisliked ? <i className="ri-thumb-down-fill"></i> : <i className="ri-thumb-down-line"></i>}
                </button>
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
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)} // Просто закрываем
        onSubmit={handleModalSubmit} // Передаем обработчик
        messageId={message.id} // Передаем ID сообщения (может быть полезно для контекста)
      />
    </>
  );
};

export default ChatMessage;