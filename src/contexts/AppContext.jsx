import React, { createContext, useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
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

  const [chats, setChats] = useState([
    { 
      id: 1, 
      title: "Анализ квартального отчета", 
      date: "12 марта 2025",
      messages: [
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
      ]
    },
    { 
      id: 2, 
      title: "Обзор показателей продаж", 
      date: "11 марта 2025",
      messages: []
    }
  ]);
  const [currentChat, setCurrentChat] = useState(chats[0]);

  const createNewChat = () => {
    const newChat = {
      id: uuidv4(),
      title: `Новый чат ${chats.length + 1}`,
      messages: [],
      createdAt: new Date()
    };

    setChats(prevChats => [...prevChats, newChat]);
    setCurrentChat(newChat);
  };

  const [chatMode, setChatMode] = useState('gen'); // 'gen' или 'rag'
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [activeSources, setActiveSources] = useState([]);

  const addMessage = (message, isUser = true) => {
    const newMessage = {
      id: messages.length + 1,
      text: message,
      isUser,
      timestamp: new Date()
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
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
    setShowSupportModal(prev => !prev);
  };

  return (
    <AppContext.Provider value={{ 
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
      chats,
      setChatHistory: setChats,
      chatHistory: chats,
      createNewChat,
      currentChat,
      setCurrentChat
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);