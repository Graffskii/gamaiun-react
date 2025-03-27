import React, { createContext, useState, useContext, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [sources, setSources] = useState([
        {
            id: 'corp-docs',
            name: 'Корпоративные документы',
            icon: 'ri-folder-line',
            files: [
                { id: 'corp-1', name: 'Устав компании.pdf', icon: 'ri-file-text-line' },
                { id: 'corp-2', name: 'Регламент работы.docx', icon: 'ri-file-text-line' },
                { id: 'corp-3', name: 'Должностные инструкции.pdf', icon: 'ri-file-text-line' }
            ]
        },
        {
            id: 'finance',
            name: 'Финансовые отчеты',
            icon: 'ri-file-chart-line',
            files: [
                { id: 'fin-1', name: 'Отчет Q1 2025.xlsx', icon: 'ri-file-excel-line' },
                { id: 'fin-2', name: 'Отчет Q4 2024.xlsx', icon: 'ri-file-excel-line' }
            ]
        },
        {
            id: 'kb',
            name: 'База знаний',
            icon: 'ri-book-line',
            files: [
                { id: 'kb-1', name: 'Руководство пользователя.pdf', icon: 'ri-article-line' },
                { id: 'kb-2', name: 'FAQ.md', icon: 'ri-article-line' }
            ]
        }
    ]);



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
            selectedFiles: [],
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
            selectedFiles: [],
            messages: []
        }
    ]);
    const [currentChat, setCurrentChat] = useState(chats[0]);
    // const [isLoading, setIsLoading] = useState(false);
    const updateSelectedFiles = useCallback((files) => {
        setSelectedFiles(files);
      }, []);

    const createNewChat = useCallback(() => {
        const newChat = {
            id: uuidv4(),
            title: `Новый чат ${chats.length + 1}`,
            messages: [],
            selectedFiles: [...selectedFiles],
            createdAt: new Date()
        };

        setChats(prevChats => [...prevChats, newChat]);
        setCurrentChat(newChat);
    }, [chats]);

    const addMessageToChat = useCallback((chatId, message) => {
        setChats(prevChats =>
            prevChats.map(chat =>
                chat.id === chatId
                    ? {
                        ...chat,
                        messages: [
                            ...chat.messages,
                            {
                                ...message,
                                id: chat.messages.length + 1,
                                timestamp: new Date()
                            }
                        ]
                    }
                    : chat
            )
        );

        // Обновляем текущий чат, если это нужный чат
        if (currentChat && currentChat.id === chatId) {
            setCurrentChat(prevChat => ({
                ...prevChat,
                messages: [
                    ...prevChat.messages,
                    {
                        ...message,
                        id: prevChat.messages.length + 1,
                        timestamp: new Date()
                    }
                ]
            }));
        }
    }, [currentChat]);

    const [chatMode, setChatMode] = useState('gen'); // 'gen' или 'rag'
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [activeSources, setActiveSources] = useState([]);

    const simulateAIResponse = useCallback(() => {
        if (!currentChat) return;

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

        addMessageToChat(currentChat.id, {
            text: randomResponse.text,
            isUser: false
        });

        // Если в ответе есть список элементов, добавим их отдельным сообщением
        if (randomResponse.items && randomResponse.items.length > 0) {
            addMessageToChat(currentChat.id, {
                items: randomResponse.items,
                isUser: false
            });
        }
    }, [currentChat, addMessageToChat]);;

    const addMessage = useCallback((message, isUser = true) => {
        if (!currentChat) return;

        addMessageToChat(currentChat.id, {
            text: message,
            isUser
        });
    }, [currentChat, addMessageToChat]);

    const toggleSupportModal = () => {
        setShowSupportModal(prev => !prev);
    };

    return (
        <AppContext.Provider value={{
            messages,
            setMessages,
            addMessage,
            simulateAIResponse,
            updateSelectedFiles,
            selectedFiles,
            sources,
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