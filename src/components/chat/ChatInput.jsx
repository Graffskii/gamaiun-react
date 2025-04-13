import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext'; // Путь может отличаться

// Принимаем пропс disabled из MainChat
const ChatInput = ({ disabled = false }) => {
  const [inputValue, setInputValue] = useState('');
  const [showModeSelector, setShowModeSelector] = useState(false);
  // Используем sendMessage вместо addMessage и simulateAIResponse
  // isSendingMessage для блокировки кнопки во время отправки
  const { sendMessage, isSendingMessage, chatMode, setChatMode } = useAppContext();

  const handleSendMessage = () => {
    if (inputValue.trim() && !isSendingMessage && !disabled) {
      sendMessage(inputValue); // Вызываем новую функцию из контекста
      setInputValue(''); // Очищаем поле ввода
    }
  };

  const handleKeyPress = (e) => {
    // Отправляем по Enter, если не зажат Shift (для переноса строки)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Предотвращаем стандартное поведение Enter (перенос строки)
      handleSendMessage();
    }
  };

  const handleModeToggle = (e) => {
    e.stopPropagation();
    setShowModeSelector(!showModeSelector);
  };

  const setMode = (mode) => {
    setChatMode(mode);
    setShowModeSelector(false);
  };

  // Закрытие селектора режимов при клике вне его
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showModeSelector &&
        !e.target.closest('#modeSelector') &&
        !e.target.closest('#modeToggleBtn')
      ) {
        setShowModeSelector(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showModeSelector]);


  const canSend = !disabled && !isSendingMessage && inputValue.trim().length > 0;

  return (
    <div className={`p-4 border-t border-gray-700 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          {/* Можно использовать textarea для многострочного ввода */}
          <textarea
            rows={1} // Начинаем с одной строки
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Выберите чат для начала общения" : "Введите ваш запрос..."}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:border-primary resize-none overflow-y-auto max-h-24" // Добавили resize-none и max-h
            disabled={disabled || isSendingMessage} // Блокируем во время отправки или если чат не выбран
            style={{ scrollbarWidth: 'thin' }} // Для Firefox
          />
           {/* TODO: Добавить автоувеличение высоты textarea при вводе */}
        </div>
        <div className="flex items-center gap-2">
          {/* Селектор режима (оставляем как есть) */}
          <div className="relative">
            <button
              id="modeToggleBtn"
              onClick={handleModeToggle}
              className={`text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 ${disabled ? 'cursor-not-allowed' : ''}`}
              disabled={disabled}
            >
              <i className="ri-settings-3-line text-xl"></i>
            </button>
             {/* ... остальной код селектора ... */}
              <div
              id="modeSelector"
              className={`absolute bottom-full right-0 mb-2 bg-[#1E293B] border border-gray-700 rounded-lg p-2 w-48 shadow-lg ${
                showModeSelector ? '' : 'hidden'
              }`}
            >
              <div className="flex bg-gray-800 p-1 rounded-full">
                <button
                  onClick={() => setMode('gen')}
                  className={`flex-1 py-1 px-3 rounded-full text-sm transition-all duration-200 ${
                    chatMode === 'gen' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Gen
                </button>
                <button
                  onClick={() => setMode('rag')}
                  className={`flex-1 py-1 px-3 rounded-full text-sm transition-all duration-200 ${
                    chatMode === 'rag' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  RAG
                </button>
              </div>
            </div>
          </div>

          {/* Кнопка отправки */}
          <button
            onClick={handleSendMessage}
            // Блокируем кнопку, если нельзя отправить
            disabled={!canSend}
            className={`text-white rounded-button py-2 px-4 flex items-center gap-2 transition-colors duration-200 ${
                canSend
                ? 'bg-primary hover:bg-blue-600'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {isSendingMessage ? (
                // Можно добавить спиннер
                 <i className="ri-loader-4-line animate-spin"></i>
            ) : (
                 <i className="ri-send-plane-line"></i>
            )}

            <span>{isSendingMessage ? 'Отправка...' : 'Отправить'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;