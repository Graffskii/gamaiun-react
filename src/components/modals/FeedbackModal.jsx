// src/components/modals/FeedbackModal.jsx
import React, { useState, useEffect } from 'react';

const FeedbackModal = ({ isOpen, onClose, onSubmit, messageId }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Состояние для индикатора загрузки

  // Сбрасываем комментарий при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setComment('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      // Можно добавить валидацию или просто разрешить пустой комментарий, если передумал дизлайкать?
      // Пока требуем комментарий для дизлайка
      alert('Пожалуйста, опишите причину вашей оценки.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Вызываем onSubmit, переданный из ChatMessage, передаем комментарий
      await onSubmit(comment);
      onClose(); // Закрываем модальное окно при успехе
    } catch (error) {
      // Ошибку должен обработать вызывающий компонент (ChatMessage/AppContext)
      console.error("Feedback submission failed from modal:", error);
      // Можно показать сообщение об ошибке прямо в модальном окне
       alert(`Не удалось отправить отзыв: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null; // Не рендерим ничего, если модальное окно закрыто
  }

  return (
    // Оверлей
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      {/* Контейнер модального окна */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative border border-gray-700">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
          aria-label="Закрыть"
          disabled={isSubmitting}
        >
          ×
        </button>

        {/* Содержимое */}
        <h2 className="text-xl font-semibold text-white mb-4">Что не понравилось?</h2>
        <p className="text-sm text-gray-400 mb-4">
          Ваш отзыв поможет нам улучшить ответы. Пожалуйста, опишите проблему.
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Опишите проблему (например, неверная информация, ответ не по теме...)"
            rows={4}
            required
            disabled={isSubmitting}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary mb-4 resize-none"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition duration-150"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className={`py-2 px-5 rounded-md transition duration-150 flex items-center justify-center ${
                isSubmitting || !comment.trim()
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-primary hover:bg-blue-600 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Отправка...
                </>
              ) : (
                'Отправить отзыв'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;