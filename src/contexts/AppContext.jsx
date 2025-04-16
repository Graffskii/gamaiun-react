import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
// import { v4 as uuidv4 } from 'uuid'; // uuid больше не нужен для ID чатов/сообщений от бэка
import { useAuth } from './AuthContext'; // Импортируем useAuth

const API_BASE_URL = 'http://localhost:5000/api';

const AppContext = createContext();

// --- Вспомогательная функция для API запросов с токеном ---
// (Можно вынести в отдельный файл api.js)
const apiFetch = async (url, options = {}, token) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers, // Позволяет переопределить заголовки
    };
    // Добавляем токен авторизации, если он есть
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    // Попытаемся распарсить тело ответа, даже если статус не ОК (для сообщений об ошибках)
    let data;
    try {
        data = await response.json();
    } catch (e) {
        // Если тело не JSON или пустое, data останется undefined
        // Это нормально для ответов типа 204 No Content
        if (response.status === 204) {
            return { response, data: null }; // Возвращаем null для 204
        }
    }


    if (!response.ok) {
        // Бросаем ошибку с сообщением от сервера, если оно есть, или статус-текстом
        const errorMessage = data?.message || response.statusText || `HTTP error ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status; // Добавляем статус к объекту ошибки
        error.data = data; // Добавляем тело ответа к ошибке для возможного анализа
        throw error;
    }

    return { response, data }; // Возвращаем и ответ, и данные
};


export const AppProvider = ({ children }) => {
    const { token, user, logout } = useAuth(); // Получаем токен, пользователя и logout из AuthContext

    // Состояния чатов и сообщений
    const [chats, setChats] = useState([]); // Список всех чатов пользователя
    const [currentChat, setCurrentChat] = useState(null); // Выбранный чат (объект)
    const [messages, setMessages] = useState([]); // Сообщения текущего чата

    // Состояния загрузки
    const [isLoadingChats, setIsLoadingChats] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false); // Для индикации отправки

    // Состояние ошибок
    const [chatError, setChatError] = useState(null);

    // Состояние выбора модели для ответа
    const [chatMode, setChatMode] = useState('gen');

    // --- Функция обновления состояния сообщения (добавление/изменение фидбека) ---
    const updateMessageFeedbackStatus = useCallback((messageId, status) => {
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === messageId
                    ? { ...msg, feedbackStatus: status } // Добавляем/обновляем поле feedbackStatus
                    : msg
            )
        );
    }, []); // Нет зависимостей, т.к. setMessages стабильна

    // --- Функция для отправки фидбека на бэкенд ---
    const submitFeedback = useCallback(async (messageId, rating, comment = null) => {
        if (!token) {
            console.error("Cannot submit feedback: Not authenticated.");
            throw new Error("Необходимо войти в систему для отправки отзыва.");
        }

        // Оптимистичное обновление UI (сразу показываем выбранный статус)
        updateMessageFeedbackStatus(messageId, rating);

        try {
            const body = { rating };
            if (rating === 'dislike' && comment) {
                body.comment = comment;
            }

            // Находим chatId для нужного messageId
            // Это не самый эффективный способ, но рабочий для текущей структуры
            let chatId = null;
            chats.forEach(chat => {
                if (chat.messages?.find(msg => msg.id === messageId) || currentChat?.id === chat.id) {
                     // Если сообщение нашлось в истории чата или это текущий чат
                     // (сообщения текущего чата могут быть только в `messages`, а не в `chats` массиве)
                     // Для надежности лучше бы знать chatId заранее
                     chatId = chat.id;
                }
            });

            // Если сообщение принадлежит текущему чату, берем его ID
            const messageInCurrentChat = messages.find(msg => msg.id === messageId);
             if (messageInCurrentChat && currentChat) {
                chatId = currentChat.id;
             }


            if (!chatId) {
                console.error(`Could not find chat ID for message ID: ${messageId}`);
                 // Откатываем оптимистичное обновление
                updateMessageFeedbackStatus(messageId, undefined); // Сбрасываем статус
                throw new Error("Не удалось определить чат для этого сообщения.");
            }


            // Формируем URL для API
            const apiUrl = `/chats/${chatId}/messages/${messageId}/feedback`;

            await apiFetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify(body)
            }, token);

            console.log(`Feedback (${rating}) submitted successfully for message ${messageId}`);
            // Статус уже обновлен оптимистично

        } catch (error) {
            console.error("Failed to submit feedback:", error);
            // Откатываем оптимистичное обновление в случае ошибки
            updateMessageFeedbackStatus(messageId, undefined); // Сбрасываем статус
            setChatError(`Ошибка отправки отзыва: ${error.message}`); // Показываем ошибку
            // Перебрасываем ошибку, чтобы модальное окно могло ее поймать
            throw error;
        }
    }, [token, updateMessageFeedbackStatus, chats, messages, currentChat]); // Добавили зависимости

    // --- Загрузка списка чатов пользователя ---
    const fetchChats = useCallback(async () => {
        if (!token) {
             setChats([]); // Если токена нет, очищаем чаты
             setCurrentChat(null);
             setMessages([]);
             return; // Выходим, если нет токена
        }
        setIsLoadingChats(true);
        setChatError(null);
        try {
            const { data: fetchedChats } = await apiFetch('/chats', {}, token);
            // Сортируем чаты по дате обновления (или создания), самые новые сверху
            const sortedChats = fetchedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            setChats(sortedChats);
            // // Автоматически выбираем самый последний чат, если он есть
            // if (sortedChats.length > 0 && !currentChat) {
            //     // Вызываем функцию выбора чата, чтобы загрузить сообщения
            //     await selectChat(sortedChats[0].id);
            // } else if (sortedChats.length === 0) {
            //     setCurrentChat(null); // Нет чатов - нет текущего
            //     setMessages([]);
            // }
            // // Если currentChat уже был, но его удалили (нет в fetchedChats), сбросим его
            // else if (currentChat && !sortedChats.find(c => c.id === currentChat.id)) {
            //     setCurrentChat(sortedChats.length > 0 ? sortedChats[0] : null);
            //     setMessages(sortedChats.length > 0 ? [] : []); // Очищаем сообщения или ставим пустой массив
            //     if (sortedChats.length > 0) {
            //        await selectChat(sortedChats[0].id); // Загружаем сообщения для нового текущего чата
            //     }
            // }

        } catch (error) {
            console.error("Failed to fetch chats:", error);
            setChatError(`Не удалось загрузить чаты: ${error.message}`);
            setChats([]); // Очищаем в случае ошибки
            setCurrentChat(null);
            setMessages([]);
            if (error.status === 401) { // Если токен невалиден/протух
                logout(); // Разлогиниваем пользователя
            }
        } finally {
            setIsLoadingChats(false);
        }
    }, [token, logout]); // Добавляем currentChat в зависимости, чтобы обработать его удаление

    // --- Загрузка сообщений для конкретного чата ---
    const fetchMessagesForChat = useCallback(async (chatId) => {
        if (!token || !chatId) return; // Нужен токен и ID чата
        setIsLoadingMessages(true);
        setChatError(null);
        setMessages([]); // Очищаем предыдущие сообщения перед загрузкой
        try {
            const { data: fetchedMessages } = await apiFetch(`/chats/${chatId}/messages`, {}, token);
             // Маппинг ответа бэкенда к структуре фронтенда, если нужно
             const formattedMessages = fetchedMessages.map(msg => ({
                id: msg.id,
                text: msg.content,
                isUser: msg.sender === 'user', // Определяем по полю sender
                timestamp: new Date(msg.timestamp), // Преобразуем строку в дату
                metadata: msg.metadata // Сохраняем метаданные, если они есть
                // Добавь другие поля при необходимости
            }));
            setMessages(formattedMessages);
        } catch (error) {
            console.error(`Failed to fetch messages for chat ${chatId}:`, error);
            setChatError(`Не удалось загрузить сообщения: ${error.message}`);
            setMessages([]); // Очищаем в случае ошибки
             if (error.status === 401) {
                logout();
            } else if (error.status === 403 || error.status === 404) {
                // Чат не найден или нет доступа, возможно его удалили
                // Перезагружаем список чатов, чтобы убрать его из списка
                await fetchChats();
            }
        } finally {
            setIsLoadingMessages(false);
        }
    }, [token, logout]);

    // --- Выбор текущего чата ---
    const selectChat = useCallback(async (chatId) => {
        if (chatId === null || typeof chatId === 'undefined') {
            setCurrentChat(null);
            setMessages([]);
            return;
        }
        const chatToSelect = chats.find(c => c.id === chatId);
        if (chatToSelect && (!currentChat || currentChat.id !== chatId)) {
            setCurrentChat(chatToSelect);
            await fetchMessagesForChat(chatId); // Загружаем сообщения для выбранного чата
        } else if (!chatToSelect) {
            console.warn(`Attempted to select non-existent chat ID: ${chatId}`);
            // Возможно, чат был удален, перезагрузим список
            await fetchChats();
        }
    }, [chats, currentChat, fetchMessagesForChat]); // Добавили fetchChats


    // --- Создание нового чата ---
    const createNewChat = useCallback(async (title = null) => { // Принимаем опциональный title
        if (!token) return; // Нужен токен
        setIsLoadingChats(true); // Можно использовать isLoadingChats или добавить новый флаг
        setChatError(null);
        try {
            // Отправляем запрос на создание чата
            const body = title ? { title } : {}; // Отправляем title, если он есть
            const { data: newChatFromApi } = await apiFetch('/chats', {
                method: 'POST',
                body: JSON.stringify(body)
            }, token);

            // Форматируем ответ API под структуру фронтенда (добавляем пустые сообщения)
            const newChatForState = {
                ...newChatFromApi,
                 // На бэке нет поля date, используем createdAt или updatedAt
                date: new Date(newChatFromApi.updatedAt || newChatFromApi.createdAt).toLocaleDateString(),
                messages: [] // Новый чат начинается без сообщений
                // selectedFiles пока не трогаем, если они не хранятся на бэке для чата
            };

            // Добавляем новый чат в начало списка и делаем его текущим
            setChats(prevChats => [newChatForState, ...prevChats]);
            setCurrentChat(newChatForState);
            setMessages([]); // У нового чата нет сообщений

        } catch (error) {
            console.error("Failed to create new chat:", error);
            setChatError(`Не удалось создать чат: ${error.message}`);
             if (error.status === 401) {
                logout();
            }
        } finally {
            setIsLoadingChats(false);
        }
    }, [token, logout]);

    // --- Отправка сообщения ---
    const sendMessage = useCallback(async (messageContent) => {
        if (!token || !currentChat || !messageContent.trim()) return;

        setIsSendingMessage(true);
        setChatError(null);

        const optimisticUserMessage = {
            id: `temp-${Date.now()}`, // Временный ID для UI
            text: messageContent.trim(),
            isUser: true,
            timestamp: new Date(),
            status: 'sending' // Добавляем статус для UI
        };

        // Оптимистичное обновление: добавляем сообщение пользователя сразу
        setMessages(prev => [...prev, optimisticUserMessage]);

        try {
            const requestBody = {
                content: messageContent.trim(),
                mode: chatMode // <--- ДОБАВЛЕНО: Передаем текущий режим чата
            };
            // Отправляем сообщение на бэкенд
            const { data: apiResponse } = await apiFetch(`/chats/${currentChat.id}/messages`, {
                method: 'POST',
                body: JSON.stringify(requestBody)
            }, token);

            // Ответ бэкенда содержит userMessage и aiMessage
            const userMessageFromApi = apiResponse.userMessage;
            const aiMessageFromApi = apiResponse.aiMessage;

            // Обновляем временное сообщение пользователя данными с сервера
            // и добавляем ответ AI
            setMessages(prev => {
                // Заменяем временное сообщение на реальное
                const updatedMessages = prev.map(msg =>
                    msg.id === optimisticUserMessage.id
                        ? {
                            id: userMessageFromApi.id,
                            text: userMessageFromApi.content,
                            isUser: true,
                            timestamp: new Date(userMessageFromApi.timestamp),
                            metadata: userMessageFromApi.metadata,
                            status: 'sent' // Меняем статус
                          }
                        : msg
                );
                // Добавляем сообщение от AI
                updatedMessages.push({
                    id: aiMessageFromApi.id,
                    text: aiMessageFromApi.content,
                    isUser: false,
                    timestamp: new Date(aiMessageFromApi.timestamp),
                    metadata: aiMessageFromApi.metadata
                });
                return updatedMessages;
            });

            // Обновляем дату последнего сообщения в списке чатов (для сортировки)
            setChats(prev => prev.map(chat =>
                chat.id === currentChat.id
                    ? { ...chat, updatedAt: aiMessageFromApi.timestamp } // Используем время ответа AI
                    : chat
            ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))); // Пересортируем

        } catch (error) {
            console.error("Failed to send message:", error);
            setChatError(`Ошибка отправки: ${error.message}`);
            // Помечаем сообщение как не отправленное
             setMessages(prev => prev.map(msg =>
                    msg.id === optimisticUserMessage.id
                        ? { ...msg, status: 'error' }
                        : msg
                ));
             if (error.status === 401) {
                logout();
            }
        } finally {
            setIsSendingMessage(false);
        }

    }, [token, currentChat, logout, chatMode]);


    // --- Эффект для первоначальной загрузки чатов при монтировании или при появлении токена ---
    useEffect(() => {
        fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]); // Зависимость только от токена, fetchChats - useCallback

    useEffect(() => {
        // Этот эффект сработает, когда isLoadingChats станет false ПОСЛЕ загрузки
        if (!isLoadingChats && chats.length > 0 && !currentChat) {
            // Если чаты загружены, их больше нуля, и НИ ОДИН чат не выбран - выбираем первый (самый новый)
            selectChat(chats[0].id);
        }
        // Дополнительная проверка: если currentChat установлен, но его больше нет в списке chats (например, удалили)
        else if (!isLoadingChats && currentChat && !chats.find(c => c.id === currentChat.id)) {
             // Выбираем первый из оставшихся или null, если список пуст
             selectChat(chats.length > 0 ? chats[0].id : null);
        }

    // Зависимости: этот эффект должен реагировать на изменение состояния загрузки, списка чатов и текущего чата
    }, [chats, currentChat, isLoadingChats, selectChat]);

    // ------------ Остальные состояния и функции (sources, chatMode и т.д.) пока оставляем без изменений -----------
    // Их нужно будет либо тоже связать с бэкендом (если они там хранятся), либо оставить как локальное состояние UI
    const [selectedFiles, setSelectedFiles] = useState([]); // Это, вероятно, UI состояние
    const [sources, setSources] = useState([ /* ... твои sources ... */ ]); // Это тоже может быть UI или загружаться откуда-то
    
    const [showSupportModal, setShowSupportModal] = useState(false); // UI состояние
    const [activeSources, setActiveSources] = useState([]); // UI состояние

    const updateSelectedFiles = useCallback((files) => { setSelectedFiles(files); }, []);
    const toggleSupportModal = () => { setShowSupportModal(prev => !prev); };
    //------------------------------------------------------------------------------------------------------------


    return (
        <AppContext.Provider value={{
            // Данные
            chats,
            currentChat,
            messages,
            sources, // Оставляем пока
            selectedFiles, // Оставляем пока
            activeSources, // Оставляем пока

            // Состояния UI и загрузки
            isLoadingChats,
            isLoadingMessages,
            isSendingMessage,
            chatError,
            chatMode, 
            showSupportModal, // Оставляем пока

            // Функции
            fetchChats, // Можно вызывать для обновления списка
            selectChat,
            createNewChat,
            sendMessage, 
            setChatMode, 
            toggleSupportModal, // Оставляем пока
            updateSelectedFiles, // Оставляем пока
            setActiveSources, // Оставляем пока
            submitFeedback,

            // Старые функции (удалить или адаптировать)
            // setMessages, // Прямое изменение сообщений теперь не нужно
            // addMessage: sendMessage, // Переименовали
            // simulateAIResponse, // Заменено логикой в sendMessage
            // setChatHistory: setChats, // Прямое изменение чатов не нужно
            // chatHistory: chats, // Используем chats
            // setCurrentChat: selectChat // Используем selectChat
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);