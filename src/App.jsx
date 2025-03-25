import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import { AppContext } from './contexts/AppContext';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "На основе анализа финансовых показателей за последний квартал можно отметить следующие ключевые моменты:",
      items: [
        "Рост выручки на 15% по сравнению с предыдущим кварталом",
        "Увеличение операционной маржи на 2.5 процентных пункта",
        "Снижение операционных расходов на 8%"
      ],
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const [chatMode, setChatMode] = useState('gen'); // 'gen' или 'rag'
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [activeSources, setActiveSources] = useState([]);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: "Анализ квартального отчета", date: "12 марта 2025" },
    { id: 2, title: "Обзор показателей продаж", date: "11 марта 2025" }
  ]);

  const addMessage = (message, isUser = true) => {
    const newMessage = {
      id: messages.length + 1,
      text: message,
      isUser,
      timestamp: new Date()
    };
    setMessages([...messages, newMessage]);
  };

  // Функция для симуляции ответа ИИ
  const simulateAIResponse = () => {
    setTimeout(() => {
      const aiResponses = [
        {
          text: "Основываясь на представленных данных, можно сделать следующие выводы:",
          items: [
            "Компания демонстрирует стабильный рост даже в текущих экономических условиях",
            "Оптимизация операционных процессов привела к значительному сокращению расходов",
            "Повышение маржинальности указывает на улучшение ценовой политики"
          ]
        },
        {
          text: "Анализ показывает следующие тенденции:",
          items: [
            "Положительная динамика выручки на протяжении последних трех кварталов",
            "Снижение себестоимости на 5.3% год к году",
            "Повышение эффективности маркетинговых кампаний на 12%"
          ]
        }
      ];

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

      addMessage(randomResponse.text, false);

      // Если в ответе есть список элементов, добавим их отдельным сообщением
      if (randomResponse.items && randomResponse.items.length > 0) {
        const newMessage = {
          id: messages.length + 2,
          items: randomResponse.items,
          isUser: false,
          timestamp: new Date()
        };

        setTimeout(() => {
          setMessages(prevMessages => [...prevMessages, newMessage]);
        }, 500);
      }
    }, 1000);
  };

  const toggleSupportModal = () => {
    setShowSupportModal(!showSupportModal);
  };

  const contextValue = {
    messages,
    setMessages,
    addMessage,
    simulateAIResponse,
    chatMode,
    setChatMode,
    showSupportModal,
    toggleSupportModal,
    activeSources,
    setActiveSources,
    chatHistory,
    setChatHistory
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Layout />
    </AppContext.Provider>
  );
}

export default App;