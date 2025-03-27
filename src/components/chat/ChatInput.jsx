import React, { useState, useContext } from 'react';
import { useAppContext } from '../../contexts/AppContext';

const ChatInput = () => {
  const [inputValue, setInputValue] = useState('');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const { addMessage, simulateAIResponse, chatMode, setChatMode } = useAppContext();

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      addMessage(inputValue);
      setInputValue('');
      simulateAIResponse();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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

  return (
    <div className="p-4 border-t border-gray-700">
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите ваш запрос..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              id="modeToggleBtn"
              onClick={handleModeToggle}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700"
            >
              <i className="ri-settings-3-line text-xl"></i>
            </button>
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
          <button
            onClick={handleSendMessage}
            className="bg-primary hover:bg-blue-600 text-white rounded-button py-2 px-4 flex items-center gap-2"
          >
            <i className="ri-send-plane-line"></i>
            <span>Отправить</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;